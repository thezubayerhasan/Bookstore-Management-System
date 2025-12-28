import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { promisePool } from '../../config/db.js';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Password length validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Block admin emails from registration
    const ADMIN_EMAILS = ['zubayer@gmail.com', 'tuli@gmail.com', 'shafin@gmail.com'];
    if (ADMIN_EMAILS.includes(email.toLowerCase())) {
      return res.status(403).json({
        success: false,
        message: 'This email is reserved and cannot be registered'
      });
    }

    // Check if user already exists
    const [existingUsers] = await promisePool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user into database (always as 'user' role)
    const [result] = await promisePool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, 'user']
    );

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: result.insertId,
        email: email,
        role: 'user'
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        userId: result.insertId,
        name,
        email,
        role: 'user',
        token
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Hardcoded admin credentials (not stored in database)
    const ADMIN_CREDENTIALS = {
      'zubayer@gmail.com': '123456',
      'tuli@gmail.com': '147852',
      'shafin@gmail.com': '258963'
    };

    // Check if it's admin login
    const normalizedEmail = email.toLowerCase();
    if (ADMIN_CREDENTIALS[normalizedEmail] && password === ADMIN_CREDENTIALS[normalizedEmail]) {
      // Generate JWT token for admin
      const token = jwt.sign(
        { 
          userId: 'admin_' + normalizedEmail,
          email: email,
          role: 'admin'
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      // Get admin name from email
      const adminName = normalizedEmail.split('@')[0].charAt(0).toUpperCase() + normalizedEmail.split('@')[0].slice(1);

      return res.status(200).json({
        success: true,
        message: 'Admin login successful',
        data: {
          userId: 'admin_' + normalizedEmail,
          name: adminName + ' (Admin)',
          email: email,
          phone: null,
          address: null,
          role: 'admin',
          token
        }
      });
    }

    // Find regular user by email in database
    const [users] = await promisePool.query(
      'SELECT id, name, email, phone, address, password, role, created_at FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = users[0];

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        userId: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
});

// @route   GET /api/auth/verify
// @desc    Verify JWT token
// @access  Private
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if it's admin token
    if (decoded.role === 'admin' && decoded.userId.startsWith('admin_')) {
      const adminEmail = decoded.userId.replace('admin_', '');
      const adminName = adminEmail.split('@')[0].charAt(0).toUpperCase() + adminEmail.split('@')[0].slice(1);
      
      return res.status(200).json({
        success: true,
        message: 'Token is valid',
        data: {
          userId: decoded.userId,
          id: decoded.userId,
          name: adminName + ' (Admin)',
          email: decoded.email,
          phone: null,
          address: null,
          role: 'admin',
          created_at: new Date()
        }
      });
    }

    // Get regular user data from database
    const [users] = await promisePool.query(
      'SELECT id, name, email, phone, address, role, created_at FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userData = users[0];
    res.status(200).json({
      success: true,
      message: 'Token is valid',
      data: {
        userId: userData.id,
        id: userData.id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        address: userData.address,
        role: userData.role,
        created_at: userData.created_at
      }
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    console.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying token',
      error: error.message
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { name, phone, address } = req.body;

    console.log('Decoded token:', decoded); // Debug log
    console.log('Update data:', { name, phone, address }); // Debug log

    // Check if it's admin (admin cannot update profile)
    if (decoded.role === 'admin' || (decoded.userId && decoded.userId.toString().startsWith('admin_'))) {
      return res.status(403).json({
        success: false,
        message: 'Admin profile cannot be updated'
      });
    }

    // Validation
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }

    // Update user profile
    const [updateResult] = await promisePool.query(
      'UPDATE users SET name = ?, phone = ?, address = ? WHERE id = ?',
      [name, phone || null, address || null, decoded.userId]
    );

    console.log('Update result:', updateResult); // Debug log

    // Get updated user data
    const [users] = await promisePool.query(
      'SELECT id, name, email, phone, address, role, created_at FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userData = users[0];
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        userId: userData.id,
        id: userData.id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        address: userData.address,
        role: userData.role,
        created_at: userData.created_at
      }
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      console.error('JWT Error:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    if (error.name === 'TokenExpiredError') {
      console.error('Token Expired:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    console.error('Profile update error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
});

export default router;