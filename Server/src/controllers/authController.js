const { promisePool } = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
const register = async (req, res) => {
  try {
    const { email, password, name, phone, address } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Password strength validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user exists
    const [existingUsers] = await promisePool.query(
      'SELECT id FROM workers WHERE email = $1',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    // Postgres uses RETURNING to get the inserted row/id
    const [result] = await promisePool.query(
      'INSERT INTO workers (email, password, name, phone, address) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [email, hashedPassword, name || null, phone || null, address || null]
    );

    // Get created user
    const [users] = await promisePool.query(
      'SELECT id, email, name, phone, address, role, created_at FROM workers WHERE id = $1',
      [result[0].id]
    );

    const user = users[0];

    // Generate token
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          address: user.address,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Get user from database
    const [users] = await promisePool.query(
      'SELECT * FROM workers WHERE email = $1',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = users[0];

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          address: user.address,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// @route   POST /api/auth/admin-login
// @desc    Admin Login
// @access  Public
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Get user from database
    const [users] = await promisePool.query(
      'SELECT * FROM workers WHERE email = $1',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = users[0];

    // Check if user is ADMIN
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Admin login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during admin login'
    });
  }
};

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
const getMe = async (req, res) => {
  try {
    const [users] = await promisePool.query(
      'SELECT id, email, name, phone, address, role, created_at FROM workers WHERE id = $1',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: users[0]
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @route   PUT /api/auth/update
// @desc    Update user profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const userId = req.user.id;

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramIndex}`);
      values.push(name);
      paramIndex++;
    }
    if (phone !== undefined) {
      updates.push(`phone = $${paramIndex}`);
      values.push(phone);
      paramIndex++;
    }
    if (address !== undefined) {
      updates.push(`address = $${paramIndex}`);
      values.push(address);
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    values.push(userId);

    await promisePool.query(
      `UPDATE workers SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
      values
    );

    // Get updated user
    const [users] = await promisePool.query(
      'SELECT id, email, name, phone, address, role FROM workers WHERE id = $1',
      [userId]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: users[0]
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during update'
    });
  }
};

// Mock OTP Store (In-memory for demo)
const otpStore = {};

// @route   POST /api/auth/send-otp
// @desc    Send OTP to phone number
// @access  Public
const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // Store OTP with expiration (5 minutes)
    otpStore[phone] = {
      otp,
      expires: Date.now() + 5 * 60 * 1000
    };

    // Fast2SMS Integration
    const message = `${otp} is your otp to login at A6`;

    if (process.env.FAST2SMS_API_KEY) {
      try {
        const response = await axios.post('https://www.fast2sms.com/dev/bulkV2', {
          "route": "q",
          "message": message,
          "language": "english",
          "flash": 0,
          "numbers": phone,
        }, {
          headers: {
            "authorization": process.env.FAST2SMS_API_KEY,
            "Content-Type": "application/json"
          }
        });
        console.log('Fast2SMS Response:', response.data);
      } catch (smsError) {
        console.error('Fast2SMS Error:', smsError.response ? smsError.response.data : smsError.message);
        // Fallback to console log for dev/debugging if SMS fails
        console.log(`📱 [MOCK SMS FALLBACK] OTP for ${phone}: ${otp}`);
      }
    } else {
      console.log(`📱 [MOCK SMS] OTP for ${phone}: ${otp} (FAST2SMS_API_KEY not set)`);
    }

    res.json({
      success: true,
      message: 'OTP sent successfully'
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error sending OTP'
    });
  }
};

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP and login/register user
// @access  Public
const verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and OTP are required'
      });
    }

    // Verify OTP
    const storedData = otpStore[phone];
    if (!storedData) {
      return res.status(400).json({
        success: false,
        message: 'OTP expired or not sent'
      });
    }

    if (storedData.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    if (Date.now() > storedData.expires) {
      delete otpStore[phone];
      return res.status(400).json({
        success: false,
        message: 'OTP expired'
      });
    }

    // OTP Valid - Clear it
    delete otpStore[phone];

    // Check if user exists
    const [users] = await promisePool.query(
      'SELECT * FROM workers WHERE phone = $1',
      [phone]
    );

    let user;

    if (users.length > 0) {
      // Existing user
      user = users[0];
    } else {
      // New user - Register
      // Generate a dummy email/password since schema might require it (or we make them nullable/dummy)
      // For now, assuming we can insert with just phone or dummy data
      const dummyEmail = `${phone}@mobile.user`;
      const dummyPassword = await bcrypt.hash(Math.random().toString(36), 10); // Random password

      const [result] = await promisePool.query(
        'INSERT INTO workers (phone, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
        [phone, dummyEmail, dummyPassword, 'user']
      );

      const [newUsers] = await promisePool.query(
        'SELECT * FROM workers WHERE id = $1',
        [result[0].id]
      );
      user = newUsers[0];
    }

    // Generate token
    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          address: user.address,
          role: user.role
        },
        token
      }
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error verifying OTP'
    });
  }
};

module.exports = {
  register,
  login,
  adminLogin,
  getMe,
  updateProfile,
  sendOtp,
  verifyOtp
};
