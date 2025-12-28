import express from 'express';
import { promisePool } from '../../config/db.js';

const router = express.Router();

// Membership pricing
const MEMBERSHIP_PRICES = {
  basic: 9.99,
  premium: 19.99,
  enterprise: 49.99
};

// @route   POST /api/memberships/subscribe
// @desc    Subscribe to a membership plan
// @access  Private
router.post('/subscribe', async (req, res) => {
  try {
    const { userId, planType, duration = 30 } = req.body;

    // Validation
    if (!userId || !planType) {
      return res.status(400).json({
        success: false,
        message: 'Please provide userId and planType'
      });
    }

    if (!['basic', 'premium', 'enterprise'].includes(planType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan type. Must be: basic, premium, or enterprise'
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

    // Check if user already has an active membership
    const [existingMemberships] = await promisePool.query(
      `SELECT id, plan_type, start_date, end_date 
       FROM memberships 
       WHERE user_id = ? AND status = 'active' AND end_date > CURDATE()`,
      [userId]
    );

    if (existingMemberships.length > 0) {
      const membership = existingMemberships[0];
      const startDate = new Date(membership.start_date);
      const now = new Date();
      const daysSinceStart = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
      
      // Check if at least 30 days have passed since start
      if (daysSinceStart < 30) {
        return res.status(409).json({
          success: false,
          message: `You can change your subscription after one month. ${30 - daysSinceStart} days remaining.`,
          daysRemaining: 30 - daysSinceStart,
          data: membership
        });
      }
      
      // If 30+ days passed, cancel old membership and create new one
      await promisePool.query(
        'UPDATE memberships SET status = ? WHERE id = ?',
        ['cancelled', membership.id]
      );
    }

    // Calculate dates and price
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + duration);

    const price = MEMBERSHIP_PRICES[planType];

    // Create membership
    const [result] = await promisePool.query(
      `INSERT INTO memberships (user_id, plan_type, status, start_date, end_date, price)
       VALUES (?, ?, 'active', ?, ?, ?)`,
      [
        userId,
        planType,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0],
        price
      ]
    );

    const [newMembership] = await promisePool.query(
      'SELECT * FROM memberships WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Membership subscribed successfully',
      data: newMembership[0]
    });

  } catch (error) {
    console.error('Subscribe membership error:', error);
    res.status(500).json({
      success: false,
      message: 'Error subscribing to membership',
      error: error.message
    });
  }
});

// @route   GET /api/memberships/user/:userId
// @desc    Get user's membership status
// @access  Private
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const [memberships] = await promisePool.query(
      `SELECT m.*, u.name as user_name, u.email as user_email
       FROM memberships m
       INNER JOIN users u ON m.user_id = u.id
       WHERE m.user_id = ?
       ORDER BY m.created_at DESC`,
      [userId]
    );

    // Find active membership
    const activeMembership = memberships.find(
      m => m.status === 'active' && new Date(m.end_date) > new Date()
    );

    res.status(200).json({
      success: true,
      data: {
        activeMembership: activeMembership || null,
        history: memberships
      }
    });

  } catch (error) {
    console.error('Get user memberships error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user memberships',
      error: error.message
    });
  }
});

// @route   PUT /api/memberships/:id/cancel
// @desc    Cancel a membership
// @access  Private
router.put('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if membership exists
    const [memberships] = await promisePool.query(
      'SELECT * FROM memberships WHERE id = ?',
      [id]
    );

    if (memberships.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Membership not found'
      });
    }

    if (memberships[0].status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Membership is not active'
      });
    }

    // Cancel membership
    await promisePool.query(
      'UPDATE memberships SET status = ? WHERE id = ?',
      ['cancelled', id]
    );

    const [updatedMembership] = await promisePool.query(
      'SELECT * FROM memberships WHERE id = ?',
      [id]
    );

    res.status(200).json({
      success: true,
      message: 'Membership cancelled successfully',
      data: updatedMembership[0]
    });

  } catch (error) {
    console.error('Cancel membership error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling membership',
      error: error.message
    });
  }
});

// @route   PUT /api/memberships/:id/renew
// @desc    Renew a membership
// @access  Private
router.put('/:id/renew', async (req, res) => {
  try {
    const { id } = req.params;
    const { duration = 30 } = req.body;

    // Get membership details
    const [memberships] = await promisePool.query(
      'SELECT * FROM memberships WHERE id = ?',
      [id]
    );

    if (memberships.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Membership not found'
      });
    }

    const membership = memberships[0];

    // Calculate new end date
    const currentEndDate = new Date(membership.end_date);
    const today = new Date();
    const baseDate = currentEndDate > today ? currentEndDate : today;
    
    const newEndDate = new Date(baseDate);
    newEndDate.setDate(newEndDate.getDate() + duration);

    // Update membership
    await promisePool.query(
      `UPDATE memberships 
       SET end_date = ?, status = 'active', price = price + ?
       WHERE id = ?`,
      [
        newEndDate.toISOString().split('T')[0],
        MEMBERSHIP_PRICES[membership.plan_type],
        id
      ]
    );

    const [renewedMembership] = await promisePool.query(
      'SELECT * FROM memberships WHERE id = ?',
      [id]
    );

    res.status(200).json({
      success: true,
      message: 'Membership renewed successfully',
      data: renewedMembership[0]
    });

  } catch (error) {
    console.error('Renew membership error:', error);
    res.status(500).json({
      success: false,
      message: 'Error renewing membership',
      error: error.message
    });
  }
});

// @route   GET /api/memberships/plans
// @desc    Get all available membership plans with pricing
// @access  Public
router.get('/plans', async (req, res) => {
  try {
    const plans = [
      {
        type: 'basic',
        name: 'Basic Plan',
        price: MEMBERSHIP_PRICES.basic,
        features: [
          'Access to 100+ ebooks',
          'Basic support',
          '1 device',
          'Standard quality'
        ]
      },
      {
        type: 'premium',
        name: 'Premium Plan',
        price: MEMBERSHIP_PRICES.premium,
        features: [
          'Access to 1000+ ebooks',
          'Priority support',
          '3 devices',
          'HD quality',
          'Offline reading'
        ]
      },
      {
        type: 'enterprise',
        name: 'Enterprise Plan',
        price: MEMBERSHIP_PRICES.enterprise,
        features: [
          'Unlimited ebooks access',
          '24/7 support',
          'Unlimited devices',
          '4K quality',
          'Offline reading',
          'Early access to new releases',
          'Exclusive author interviews'
        ]
      }
    ];

    res.status(200).json({
      success: true,
      data: plans
    });

  } catch (error) {
    console.error('Get membership plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching membership plans',
      error: error.message
    });
  }
});

// @route   DELETE /api/memberships/:id
// @desc    Delete a membership record (Admin only)
// @access  Private/Admin
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await promisePool.query(
      'DELETE FROM memberships WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Membership not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Membership deleted successfully'
    });

  } catch (error) {
    console.error('Delete membership error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting membership',
      error: error.message
    });
  }
});

export default router;