import express from 'express';
import { promisePool } from '../../config/db.js';

const router = express.Router();

// @route   POST /api/feedback
// @desc    Submit feedback/review for a book
// @access  Private
router.post('/', async (req, res) => {
  const connection = await promisePool.getConnection();
  
  try {
    const { userId, bookId, rating, comment } = req.body;

    // Validation
    if (!userId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Please provide userId and rating'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Check if user exists
    const [users] = await promisePool.query(
      'SELECT id FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if book exists (only if bookId is provided)
    if (bookId) {
      const [books] = await promisePool.query(
        'SELECT id FROM books WHERE id = ?',
        [bookId]
      );

      if (books.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Book not found'
        });
      }
    }

    await connection.beginTransaction();

    // Insert feedback
    const [result] = await connection.query(
      `INSERT INTO feedback (user_id, book_id, rating, comment)
       VALUES (?, ?, ?, ?)`,
      [userId, bookId || null, rating, comment || null]
    );

    // Update book rating and review count (only if bookId is provided)
    if (bookId) {
      await connection.query(
        `UPDATE books 
         SET rating = (
           SELECT AVG(rating) FROM feedback WHERE book_id = ?
         ),
         reviews_count = (
           SELECT COUNT(*) FROM feedback WHERE book_id = ?
         )
         WHERE id = ?`,
        [bookId, bookId, bookId]
      );
    }

    await connection.commit();

    const [newFeedback] = await promisePool.query(
      `SELECT f.*, u.name as user_name, u.email as user_email,
              b.title as book_title, b.author as book_author
       FROM feedback f
       LEFT JOIN users u ON f.user_id = u.id
       LEFT JOIN books b ON f.book_id = b.id
       WHERE f.id = ?`,
      [result.insertId]
    );
    

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: newFeedback[0]
    });

  } catch (error) {
    await connection.rollback();
    console.error('Submit feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting feedback',
      error: error.message
    });
  } finally {
    connection.release();
  }
});

// @route   GET /api/feedback/book/:bookId
// @desc    Get all feedback for a specific book
// @access  Public
router.get('/book/:bookId', async (req, res) => {
  try {
    const { bookId } = req.params;
    const { page = 1, limit = 10, sortBy = 'created_at', order = 'DESC' } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const [feedback] = await promisePool.query(
      `SELECT f.*, u.name as user_name
       FROM feedback f
       LEFT JOIN users u ON f.user_id = u.id
       WHERE f.book_id = ?
       ORDER BY ${sortBy === 'rating' ? 'f.rating' : 'f.created_at'} ${sortOrder}
       LIMIT ? OFFSET ?`,
      [bookId, parseInt(limit), offset]
    );

    // Get total count
    const [countResult] = await promisePool.query(
      'SELECT COUNT(*) as total FROM feedback WHERE book_id = ?',
      [bookId]
    );

    // Get rating distribution
    const [ratingDist] = await promisePool.query(
      `SELECT rating, COUNT(*) as count
       FROM feedback
       WHERE book_id = ?
       GROUP BY rating
       ORDER BY rating DESC`,
      [bookId]
    );

    res.status(200).json({
      success: true,
      data: {
        feedback,
        ratingDistribution: ratingDist,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(countResult[0].total / parseInt(limit)),
          totalItems: countResult[0].total,
          itemsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get book feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching book feedback',
      error: error.message
    });
  }
});

// @route   GET /api/feedback/user/:userId
// @desc    Get all feedback by a specific user
// @access  Private
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const [feedback] = await promisePool.query(
      `SELECT f.*, b.title as book_title, b.author as book_author, 
              b.cover_image as book_cover
       FROM feedback f
       INNER JOIN books b ON f.book_id = b.id
       WHERE f.user_id = ?
       ORDER BY f.created_at DESC`,
      [userId]
    );

    res.status(200).json({
      success: true,
      data: feedback
    });

  } catch (error) {
    console.error('Get user feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user feedback',
      error: error.message
    });
  }
});

// @route   GET /api/feedback/recent
// @desc    Get recent feedback across all books
// @access  Public
router.get('/recent', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const [feedback] = await promisePool.query(
      `SELECT f.*, u.name as user_name, 
              b.title as book_title, b.author as book_author,
              b.cover_image as book_cover
       FROM feedback f
       LEFT JOIN users u ON f.user_id = u.id
       LEFT JOIN books b ON f.book_id = b.id
       ORDER BY f.created_at DESC
       LIMIT ?`,
      [parseInt(limit)]
    );

    res.status(200).json({
      success: true,
      data: feedback
    });

  } catch (error) {
    console.error('Get recent feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recent feedback',
      error: error.message
    });
  }
});

// @route   PUT /api/feedback/:id
// @desc    Update feedback
// @access  Private
router.put('/:id', async (req, res) => {
  const connection = await promisePool.getConnection();
  
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    // Check if feedback exists
    const [existingFeedback] = await promisePool.query(
      'SELECT * FROM feedback WHERE id = ?',
      [id]
    );

    if (existingFeedback.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    await connection.beginTransaction();

    // Update feedback
    const updates = [];
    const values = [];

    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5'
        });
      }
      updates.push('rating = ?');
      values.push(rating);
    }

    if (comment !== undefined) {
      updates.push('comment = ?');
      values.push(comment);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    values.push(id);

    await connection.query(
      `UPDATE feedback SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Recalculate book rating if rating was updated
    if (rating !== undefined) {
      const bookId = existingFeedback[0].book_id;
      
      await connection.query(
        `UPDATE books 
         SET rating = (
           SELECT AVG(rating) FROM feedback WHERE book_id = ?
         )
         WHERE id = ?`,
        [bookId, bookId]
      );
    }

    await connection.commit();

    const [updatedFeedback] = await promisePool.query(
      `SELECT f.*, u.name as user_name, b.title as book_title
       FROM feedback f
       LEFT JOIN users u ON f.user_id = u.id
       INNER JOIN books b ON f.book_id = b.id
       WHERE f.id = ?`,
      [id]
    );

    res.status(200).json({
      success: true,
      message: 'Feedback updated successfully',
      data: updatedFeedback[0]
    });

  } catch (error) {
    await connection.rollback();
    console.error('Update feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating feedback',
      error: error.message
    });
  } finally {
    connection.release();
  }
});

// @route   DELETE /api/feedback/:id
// @desc    Delete feedback
// @access  Private
router.delete('/:id', async (req, res) => {
  const connection = await promisePool.getConnection();
  
  try {
    const { id } = req.params;

    // Get feedback details before deletion
    const [feedback] = await promisePool.query(
      'SELECT book_id FROM feedback WHERE id = ?',
      [id]
    );

    if (feedback.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    const bookId = feedback[0].book_id;

    await connection.beginTransaction();

    // Delete feedback
    await connection.query(
      'DELETE FROM feedback WHERE id = ?',
      [id]
    );

    // Recalculate book rating and review count
    await connection.query(
      `UPDATE books 
       SET rating = COALESCE((
         SELECT AVG(rating) FROM feedback WHERE book_id = ?
       ), 0),
       reviews_count = (
         SELECT COUNT(*) FROM feedback WHERE book_id = ?
       )
       WHERE id = ?`,
      [bookId, bookId, bookId]
    );

    await connection.commit();

    res.status(200).json({
      success: true,
      message: 'Feedback deleted successfully'
    });

  } catch (error) {
    await connection.rollback();
    console.error('Delete feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting feedback',
      error: error.message
    });
  } finally {
    connection.release();
  }
});

export default router;