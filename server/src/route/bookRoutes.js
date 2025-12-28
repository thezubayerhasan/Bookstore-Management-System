import express from 'express';
import { promisePool } from '../../config/db.js';

const router = express.Router();

// @route   GET /api/books
// @desc    Get all books with filtering
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      author, 
      minPrice, 
      maxPrice, 
      search, 
      featured,
      bestseller,
      sortBy = 'created_at',
      order = 'DESC',
      page = 1,
      limit = 20
    } = req.query;

    // Build dynamic query
    let query = 'SELECT * FROM books WHERE 1=1';
    const params = [];

    // Apply filters
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (author) {
      query += ' AND author LIKE ?';
      params.push(`%${author}%`);
    }

    if (minPrice) {
      query += ' AND price >= ?';
      params.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      query += ' AND price <= ?';
      params.push(parseFloat(maxPrice));
    }

    if (search) {
      query += ' AND (title LIKE ? OR author LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (featured === 'true') {
      query += ' AND is_featured = 1';
    }

    if (bestseller === 'true') {
      query += ' AND is_bestseller = 1';
    }

    // Add sorting
    const validSortFields = ['title', 'price', 'rating', 'created_at', 'publish_year'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    query += ` ORDER BY ${sortField} ${sortOrder}`;

    // Add pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    // Execute query
    const [books] = await promisePool.query(query, params);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM books WHERE 1=1';
    const countParams = params.slice(0, -2); // Remove LIMIT and OFFSET params

    if (category) countQuery += ' AND category = ?';
    if (author) countQuery += ' AND author LIKE ?';
    if (minPrice) countQuery += ' AND price >= ?';
    if (maxPrice) countQuery += ' AND price <= ?';
    if (search) countQuery += ' AND (title LIKE ? OR author LIKE ? OR description LIKE ?)';
    if (featured === 'true') countQuery += ' AND is_featured = 1';
    if (bestseller === 'true') countQuery += ' AND is_bestseller = 1';

    const [countResult] = await promisePool.query(countQuery, countParams);
    const totalBooks = countResult[0].total;

    res.status(200).json({
      success: true,
      data: books,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalBooks / parseInt(limit)),
        totalItems: totalBooks,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching books',
      error: error.message
    });
  }
});

// @route   GET /api/books/:id
// @desc    Get single book by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [books] = await promisePool.query(
      'SELECT * FROM books WHERE id = ?',
      [id]
    );

    if (books.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    res.status(200).json({
      success: true,
      data: books[0]
    });

  } catch (error) {
    console.error('Get book error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching book',
      error: error.message
    });
  }
});

// @route   POST /api/books
// @desc    Create a new book (Admin only)
// @access  Private/Admin
router.post('/', async (req, res) => {
  try {
    const {
      title,
      author,
      category,
      description,
      price,
      cover_image,
      publish_year,
      pages,
      language,
      publisher,
      isbn,
      stock_quantity,
      is_featured,
      is_bestseller
    } = req.body;

    // Validation
    if (!title || !author || !category || !price) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, author, category, and price'
      });
    }

    const [result] = await promisePool.query(
      `INSERT INTO books (
        title, author, category, description, price, cover_image,
        publish_year, pages, language, publisher, isbn, stock_quantity,
        is_featured, is_bestseller
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title, author, category, description, price, cover_image,
        publish_year, pages, language || 'English', publisher, isbn,
        stock_quantity || 0, is_featured || false, is_bestseller || false
      ]
    );

    const [newBook] = await promisePool.query(
      'SELECT * FROM books WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Book created successfully',
      data: newBook[0]
    });

  } catch (error) {
    console.error('Create book error:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'Book with this ISBN already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating book',
      error: error.message
    });
  }
});

// @route   PUT /api/books/:id
// @desc    Update a book (Admin only)
// @access  Private/Admin
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = req.body;

    // Check if book exists
    const [existingBooks] = await promisePool.query(
      'SELECT id FROM books WHERE id = ?',
      [id]
    );

    if (existingBooks.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Build dynamic update query
    const allowedFields = [
      'title', 'author', 'category', 'description', 'price', 'rating',
      'reviews_count', 'cover_image', 'publish_year', 'pages', 'language',
      'publisher', 'isbn', 'stock_quantity', 'is_featured', 'is_bestseller'
    ];

    const updates = [];
    const values = [];

    Object.keys(updateFields).forEach(field => {
      if (allowedFields.includes(field)) {
        updates.push(`${field} = ?`);
        values.push(updateFields[field]);
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    values.push(id);

    await promisePool.query(
      `UPDATE books SET ${updates.join(', ')} WHERE id = ?`,
      values
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

// @route   DELETE /api/books/:id
// @desc    Delete a book (Admin only)
// @access  Private/Admin
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await promisePool.query(
      'DELETE FROM books WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Book deleted successfully'
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

// @route   GET /api/books/categories/list
// @desc    Get all unique categories with book counts
// @access  Public
router.get('/categories/list', async (req, res) => {
  try {
    const [categories] = await promisePool.query(
      'SELECT category, COUNT(*) as count FROM books GROUP BY category ORDER BY category ASC'
    );

    res.status(200).json({
      success: true,
      data: categories
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
});

export default router;