import express from 'express';
import { promisePool } from '../../config/db.js';

const router = express.Router();

// @route   POST /api/orders
// @desc    Create a new order with transaction
// @access  Private
router.post('/', async (req, res) => {
  const connection = await promisePool.getConnection();
  
  try {
    const { userId, items, shippingAddress, paymentMethod } = req.body;

    // Validation
    if (!userId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide userId and items array'
      });
    }

    // Start transaction
    await connection.beginTransaction();

    // Calculate total amount and validate books
    let totalAmount = 0;
    const bookIds = items.map(item => item.bookId);

    const [books] = await connection.query(
      `SELECT id, title, price, stock_quantity FROM books WHERE id IN (?)`,
      [bookIds]
    );

    if (books.length !== items.length) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'One or more books not found'
      });
    }

    // Create a map for easy lookup
    const bookMap = {};
    books.forEach(book => {
      bookMap[book.id] = book;
    });

    // Validate stock and calculate total
    for (const item of items) {
      const book = bookMap[item.bookId];
      
      if (!book) {
        await connection.rollback();
        return res.status(404).json({
          success: false,
          message: `Book with ID ${item.bookId} not found`
        });
      }

      if (book.stock_quantity < item.quantity) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${book.title}". Available: ${book.stock_quantity}`
        });
      }

      totalAmount += book.price * item.quantity;
    }

    // Create order
    // Set status to 'completed' immediately since we don't have real payment processing
    const [orderResult] = await connection.query(
      `INSERT INTO orders (user_id, total_amount, status, payment_method, shipping_address)
       VALUES (?, ?, 'completed', ?, ?)`,
      [userId, totalAmount, paymentMethod || 'cash', shippingAddress || '']
    );

    const orderId = orderResult.insertId;

    // Insert order items and update stock
    for (const item of items) {
      const book = bookMap[item.bookId];

      // Insert order item
      await connection.query(
        `INSERT INTO order_items (order_id, book_id, quantity, price)
         VALUES (?, ?, ?, ?)`,
        [orderId, item.bookId, item.quantity, book.price]
      );

      // Update book stock
      await connection.query(
        `UPDATE books SET stock_quantity = stock_quantity - ? WHERE id = ?`,
        [item.quantity, item.bookId]
      );

      // Add to user_books (purchased books)
      await connection.query(
        `INSERT INTO user_books (user_id, book_id, order_id)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE order_id = VALUES(order_id)`,
        [userId, item.bookId, orderId]
      );
    }

    // Commit transaction
    await connection.commit();

    // Fetch complete order details
    const [orderDetails] = await promisePool.query(
      `SELECT o.*, 
              JSON_ARRAYAGG(
                JSON_OBJECT(
                  'id', oi.id,
                  'bookId', oi.book_id,
                  'title', b.title,
                  'author', b.author,
                  'coverImage', b.cover_image,
                  'quantity', oi.quantity,
                  'price', oi.price
                )
              ) as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN books b ON oi.book_id = b.id
       WHERE o.id = ?
       GROUP BY o.id`,
      [orderId]
    );

    // Parse items if it's a string, otherwise use as-is
    const orderItems = typeof orderDetails[0].items === 'string' 
      ? JSON.parse(orderDetails[0].items) 
      : orderDetails[0].items;

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        ...orderDetails[0],
        items: orderItems
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message
    });
  } finally {
    connection.release();
  }
});

// @route   GET /api/orders/user/:userId
// @desc    Get all orders for a user
// @access  Private
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const [orders] = await promisePool.query(
      `SELECT o.id, o.total_amount, o.status, o.payment_method, 
              o.shipping_address, o.created_at, o.updated_at,
              COUNT(oi.id) as item_count
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.user_id = ?
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [userId]
    );

    res.status(200).json({
      success: true,
      data: orders
    });

  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order details
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [orders] = await promisePool.query(
      `SELECT o.*, u.name as user_name, u.email as user_email
       FROM orders o
       INNER JOIN users u ON o.user_id = u.id
       WHERE o.id = ?`,
      [id]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const [items] = await promisePool.query(
      `SELECT oi.*, b.title, b.author, b.cover_image
       FROM order_items oi
       INNER JOIN books b ON oi.book_id = b.id
       WHERE oi.order_id = ?`,
      [id]
    );

    res.status(200).json({
      success: true,
      data: {
        ...orders[0],
        items
      }
    });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message
    });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private/Admin
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: pending, processing, completed, or cancelled'
      });
    }

    const [result] = await promisePool.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const [updatedOrder] = await promisePool.query(
      'SELECT * FROM orders WHERE id = ?',
      [id]
    );

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: updatedOrder[0]
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order status',
      error: error.message
    });
  }
});

// @route   DELETE /api/orders/:id
// @desc    Cancel/Delete an order
// @access  Private
router.delete('/:id', async (req, res) => {
  const connection = await promisePool.getConnection();

  try {
    const { id } = req.params;

    await connection.beginTransaction();

    // Get order items to restore stock
    const [items] = await connection.query(
      'SELECT book_id, quantity FROM order_items WHERE order_id = ?',
      [id]
    );

    // Restore stock for each item
    for (const item of items) {
      await connection.query(
        'UPDATE books SET stock_quantity = stock_quantity + ? WHERE id = ?',
        [item.quantity, item.book_id]
      );
    }

    // Delete order (cascade will delete order_items and user_books)
    const [result] = await connection.query(
      'DELETE FROM orders WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    await connection.commit();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully'
    });

  } catch (error) {
    await connection.rollback();
    console.error('Delete order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling order',
      error: error.message
    });
  } finally {
    connection.release();
  }
});

export default router;