import express from 'express';
import { promisePool } from '../../config/db.js';

const router = express.Router();

// @route   GET /api/user-books/:userId
// @desc    Get all purchased books for a user
// @access  Private
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const [userBooks] = await promisePool.query(
      `SELECT 
        ub.id as user_book_id,
        ub.purchased_at,
        ub.order_id,
        b.*,
        o.status as order_status
       FROM user_books ub
       INNER JOIN books b ON ub.book_id = b.id
       INNER JOIN orders o ON ub.order_id = o.id
       WHERE ub.user_id = ?
       ORDER BY ub.purchased_at DESC`,
      [userId]
    );

    res.status(200).json({
      success: true,
      data: userBooks
    });

  } catch (error) {
    console.error('Get user books error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user books',
      error: error.message
    });
  }
});

// @route   GET /api/user-books/:userId/check/:bookId
// @desc    Check if user owns a specific book
// @access  Private
router.get('/:userId/check/:bookId', async (req, res) => {
  try {
    const { userId, bookId } = req.params;

    const [result] = await promisePool.query(
      `SELECT ub.*, o.status as order_status
       FROM user_books ub
       INNER JOIN orders o ON ub.order_id = o.id
       WHERE ub.user_id = ? AND ub.book_id = ?`,
      [userId, bookId]
    );

    const owns = result.length > 0;

    res.status(200).json({
      success: true,
      data: {
        owns,
        details: owns ? result[0] : null
      }
    });

  } catch (error) {
    console.error('Check user book ownership error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking book ownership',
      error: error.message
    });
  }
});

// @route   GET /api/user-books/:userId/categories
// @desc    Get categories of books owned by user
// @access  Private
router.get('/:userId/categories', async (req, res) => {
  try {
    const { userId } = req.params;

    const [categories] = await promisePool.query(
      `SELECT DISTINCT b.category, COUNT(*) as book_count
       FROM user_books ub
       INNER JOIN books b ON ub.book_id = b.id
       WHERE ub.user_id = ?
       GROUP BY b.category
       ORDER BY book_count DESC`,
      [userId]
    );

    res.status(200).json({
      success: true,
      data: categories
    });

  } catch (error) {
    console.error('Get user book categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user book categories',
      error: error.message
    });
  }
});

// @route   GET /api/user-books/:userId/stats
// @desc    Get user's book statistics
// @access  Private
router.get('/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;

    const [stats] = await promisePool.query(
      `SELECT 
        COUNT(DISTINCT ub.book_id) as total_books,
        COUNT(DISTINCT b.category) as total_categories,
        COUNT(DISTINCT b.author) as total_authors,
        SUM(oi.price * oi.quantity) as total_spent
       FROM user_books ub
       INNER JOIN books b ON ub.book_id = b.id
       LEFT JOIN order_items oi ON ub.order_id = oi.order_id AND ub.book_id = oi.book_id
       WHERE ub.user_id = ?`,
      [userId]
    );

    res.status(200).json({
      success: true,
      data: stats[0]
    });

  } catch (error) {
    console.error('Get user book stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user book statistics',
      error: error.message
    });
  }
});

export default router;