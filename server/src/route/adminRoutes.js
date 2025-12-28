import express from 'express';
import { promisePool } from '../../config/db.js';

const router = express.Router();

// @route   GET /api/admin/dashboard
// @desc    Get dashboard statistics
// @access  Private/Admin
router.get('/dashboard', async (req, res) => {
  try {
    // Get total counts
    const [totalUsers] = await promisePool.query(
      'SELECT COUNT(*) as count FROM users WHERE role = "user"'
    );

    const [totalBooks] = await promisePool.query(
      'SELECT COUNT(*) as count FROM books'
    );

    const [totalOrders] = await promisePool.query(
      'SELECT COUNT(*) as count FROM orders'
    );

    // Total Revenue from all orders
    const [totalRevenue] = await promisePool.query(
      'SELECT COALESCE(SUM(total_amount), 0) as total FROM orders'
    );

    // Total Order Items (sum of all quantities)
    const [totalOrderItems] = await promisePool.query(
      'SELECT COALESCE(SUM(quantity), 0) as total FROM order_items'
    );

    const [activeMemberships] = await promisePool.query(
      `SELECT COUNT(*) as count FROM memberships 
       WHERE status = 'active' AND end_date > CURDATE()`
    );

    const [totalFeedback] = await promisePool.query(
      'SELECT COUNT(*) as count FROM feedback'
    );

    // Get recent orders (latest orders from database)
    const [recentOrders] = await promisePool.query(
      `SELECT o.id, o.total_amount, o.status, o.payment_method, o.created_at,
              u.name as user_name, u.email as user_email,
              GROUP_CONCAT(b.title SEPARATOR ', ') as books
       FROM orders o
       INNER JOIN users u ON o.user_id = u.id
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN books b ON oi.book_id = b.id
       GROUP BY o.id
       ORDER BY o.created_at DESC
       LIMIT 10`
    );

    // Get top selling books
    const [topBooks] = await promisePool.query(
      `SELECT b.id, b.title, b.author, b.price, b.cover_image,
              COUNT(oi.id) as total_sold,
              SUM(oi.quantity) as total_quantity
       FROM books b
       INNER JOIN order_items oi ON b.id = oi.book_id
       GROUP BY b.id
       ORDER BY total_quantity DESC
       LIMIT 10`
    );

    // Get sales by month (last 6 months)
    const [monthlySales] = await promisePool.query(
      `SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as order_count,
        SUM(total_amount) as revenue
       FROM orders
       WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
       GROUP BY DATE_FORMAT(created_at, '%Y-%m')
       ORDER BY month DESC`
    );

    // Get category distribution
    const [categoryStats] = await promisePool.query(
      `SELECT category, COUNT(*) as book_count
       FROM books
       GROUP BY category
       ORDER BY book_count DESC`
    );

    // Get order status distribution
    const [orderStatusStats] = await promisePool.query(
      `SELECT status, COUNT(*) as count
       FROM orders
       GROUP BY status`
    );

    // Get average rating
    const [avgRating] = await promisePool.query(
      'SELECT AVG(rating) as average FROM books WHERE rating > 0'
    );

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers: totalUsers[0].count,
          totalBooks: totalBooks[0].count,
          totalOrders: totalOrders[0].count,
          totalRevenue: parseFloat(totalRevenue[0].total).toFixed(2),
          totalOrderItems: parseInt(totalOrderItems[0].total),
          activeMemberships: activeMemberships[0].count,
          totalFeedback: totalFeedback[0].count,
          averageRating: parseFloat(avgRating[0].average || 0).toFixed(2)
        },
        recentOrders,
        topSellingBooks: topBooks,
        monthlySales,
        categoryDistribution: categoryStats,
        orderStatusDistribution: orderStatusStats
      }
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
      error: error.message
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with filters
// @access  Private/Admin
router.get('/users', async (req, res) => {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;
    
    let query = `SELECT u.id, u.name, u.email, u.role, u.created_at, COUNT(DISTINCT o.id) as orders
                 FROM users u
                 LEFT JOIN orders o ON u.id = o.user_id
                 WHERE 1=1`;
    const params = [];

    if (search) {
      query += ' AND (u.name LIKE ? OR u.email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (role) {
      query += ' AND u.role = ?';
      params.push(role);
    }

    query += ' GROUP BY u.id';

    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ' ORDER BY u.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [users] = await promisePool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
    const countParams = [];

    if (search) {
      countQuery += ' AND (name LIKE ? OR email LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`);
    }

    if (role) {
      countQuery += ' AND role = ?';
      countParams.push(role);
    }

    const [countResult] = await promisePool.query(countQuery, countParams);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(countResult[0].total / parseInt(limit)),
        totalItems: countResult[0].total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

// @route   GET /api/admin/users/:id/details
// @desc    Get detailed user information
// @access  Private/Admin
router.get('/users/:id/details', async (req, res) => {
  try {
    const { id } = req.params;

    // Get user info
    const [users] = await promisePool.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's order statistics
    const [orderStats] = await promisePool.query(
      `SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(total_amount), 0) as total_spent,
        MAX(created_at) as last_order_date
       FROM orders
       WHERE user_id = ?`,
      [id]
    );

    // Get user's membership info
    const [memberships] = await promisePool.query(
      `SELECT * FROM memberships 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [id]
    );

    // Get user's feedback count
    const [feedbackCount] = await promisePool.query(
      'SELECT COUNT(*) as count FROM feedback WHERE user_id = ?',
      [id]
    );

    // Get user's purchased books count
    const [booksCount] = await promisePool.query(
      'SELECT COUNT(DISTINCT book_id) as count FROM user_books WHERE user_id = ?',
      [id]
    );

    res.status(200).json({
      success: true,
      data: {
        user: users[0],
        statistics: {
          totalOrders: orderStats[0].total_orders,
          totalSpent: parseFloat(orderStats[0].total_spent).toFixed(2),
          lastOrderDate: orderStats[0].last_order_date,
          totalBooks: booksCount[0].count,
          totalFeedback: feedbackCount[0].count
        },
        membership: memberships[0] || null
      }
    });

  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user details',
      error: error.message
    });
  }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role
// @access  Private/Admin
router.put('/users/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be "user" or "admin"'
      });
    }

    const [result] = await promisePool.query(
      'UPDATE users SET role = ? WHERE id = ?',
      [role, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const [updatedUser] = await promisePool.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [id]
    );

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: updatedUser[0]
    });

  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user role',
      error: error.message
    });
  }
});

// @route   GET /api/admin/sales-report
// @desc    Get sales report with date range
// @access  Private/Admin
router.get('/sales-report', async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;

    let dateFormat;
    switch (groupBy) {
      case 'month':
        dateFormat = '%Y-%m';
        break;
      case 'year':
        dateFormat = '%Y';
        break;
      default:
        dateFormat = '%Y-%m-%d';
    }

    let query = `
      SELECT 
        DATE_FORMAT(created_at, ?) as period,
        COUNT(*) as order_count,
        SUM(total_amount) as revenue,
        AVG(total_amount) as avg_order_value
      FROM orders
      WHERE status = 'completed'
    `;
    const params = [dateFormat];

    if (startDate) {
      query += ' AND DATE(created_at) >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND DATE(created_at) <= ?';
      params.push(endDate);
    }

    query += ' GROUP BY period ORDER BY period DESC';

    const [salesData] = await promisePool.query(query, params);

    // Calculate totals
    const totals = salesData.reduce((acc, row) => ({
      totalOrders: acc.totalOrders + row.order_count,
      totalRevenue: acc.totalRevenue + parseFloat(row.revenue)
    }), { totalOrders: 0, totalRevenue: 0 });

    res.status(200).json({
      success: true,
      data: {
        salesByPeriod: salesData,
        summary: {
          totalOrders: totals.totalOrders,
          totalRevenue: totals.totalRevenue.toFixed(2),
          averageOrderValue: salesData.length > 0 
            ? (totals.totalRevenue / totals.totalOrders).toFixed(2)
            : 0
        }
      }
    });

  } catch (error) {
    console.error('Get sales report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sales report',
      error: error.message
    });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user (Admin only)
// @access  Private/Admin
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting admin users
    const [user] = await promisePool.query(
      'SELECT role FROM users WHERE id = ?',
      [id]
    );

    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user[0].role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete admin users'
      });
    }

    const [result] = await promisePool.query(
      'DELETE FROM users WHERE id = ?',
      [id]
    );

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
});

// @route   POST /api/admin/books
// @desc    Add a new book
// @access  Private/Admin
router.post('/books', async (req, res) => {
  try {
    const {
      title, author, category, description, price,
      coverImage, publishYear, pages, language, publisher, isbn,
      stockQuantity, isFeatured, isBestseller
    } = req.body;

    // Validation
    if (!title || !author || !category || !price) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, author, category, and price'
      });
    }

    // Insert book
    const [result] = await promisePool.query(
      `INSERT INTO books (
        title, author, category, description, price,
        cover_image, publish_year, pages, language, publisher, isbn,
        stock_quantity, is_featured, is_bestseller
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title, author, category, description || null, parseFloat(price),
        coverImage || null, publishYear || null, pages || null,
        language || 'English', publisher || null, isbn || null,
        stockQuantity || 0, isFeatured || false, isBestseller || false
      ]
    );

    const [newBook] = await promisePool.query(
      'SELECT * FROM books WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Book added successfully',
      data: newBook[0]
    });

  } catch (error) {
    console.error('Add book error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding book',
      error: error.message
    });
  }
});

// @route   PUT /api/admin/books/:id
// @desc    Edit a book
// @access  Private/Admin
router.put('/books/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, author, category, description, price,
      coverImage, publishYear, pages, language, publisher, isbn,
      stockQuantity, isFeatured, isBestseller
    } = req.body;

    // Check if book exists
    const [existingBook] = await promisePool.query(
      'SELECT id FROM books WHERE id = ?',
      [id]
    );

    if (existingBook.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Update book
    await promisePool.query(
      `UPDATE books SET
        title = COALESCE(?, title),
        author = COALESCE(?, author),
        category = COALESCE(?, category),
        description = COALESCE(?, description),
        price = COALESCE(?, price),
        cover_image = COALESCE(?, cover_image),
        publish_year = COALESCE(?, publish_year),
        pages = COALESCE(?, pages),
        language = COALESCE(?, language),
        publisher = COALESCE(?, publisher),
        isbn = COALESCE(?, isbn),
        stock_quantity = COALESCE(?, stock_quantity),
        is_featured = COALESCE(?, is_featured),
        is_bestseller = COALESCE(?, is_bestseller)
      WHERE id = ?`,
      [
        title, author, category, description, price ? parseFloat(price) : null,
        coverImage, publishYear, pages, language, publisher, isbn,
        stockQuantity, isFeatured, isBestseller, id
      ]
    );

    const [updatedBook] = await promisePool.query(
      'SELECT * FROM books WHERE id = ?',
      [id]
    );

    res.status(200).json({
      success: true,
      message: 'Book updated successfully',
      data: updatedBook[0]
    });

  } catch (error) {
    console.error('Update book error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating book',
      error: error.message
    });
  }
});

// @route   DELETE /api/admin/books/:id
// @desc    Delete a book
// @access  Private/Admin
router.delete('/books/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if book exists
    const [book] = await promisePool.query(
      'SELECT id, title FROM books WHERE id = ?',
      [id]
    );

    if (book.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Delete book (cascade will handle related records)
    await promisePool.query(
      'DELETE FROM books WHERE id = ?',
      [id]
    );

    res.status(200).json({
      success: true,
      message: `Book "${book[0].title}" deleted successfully`
    });

  } catch (error) {
    console.error('Delete book error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting book',
      error: error.message
    });
  }
});

export default router;