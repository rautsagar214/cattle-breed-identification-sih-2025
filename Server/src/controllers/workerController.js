const { promisePool } = require('../config/database');
const bcrypt = require('bcrypt');

// @route   POST /api/workers/register
// @desc    Register a new FLW (Field Level Worker)
// @access  Private (Admin only)
const registerFlw = async (req, res) => {
    try {
        const { name, phone, email, state, city, address } = req.body;

        // Validation
        if (!name || !phone || !email) {
            return res.status(400).json({
                success: false,
                message: 'Name, phone, and email are required'
            });
        }

        // Check if user exists
        const [existingUsers] = await promisePool.query(
            'SELECT id FROM workers WHERE email = $1 OR phone = $2',
            [email, phone]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Worker already exists with this email or phone'
            });
        }

        // Generate random password for FLW (they can reset later or receive via SMS)
        const randomPassword = Math.random().toString(36).slice(-8);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(randomPassword, salt);

        // Insert worker with role 'FLW'
        const [result] = await promisePool.query(
            'INSERT INTO workers (name, phone, email, password, address, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            [name, phone, email, hashedPassword, address || null, 'flw']
        );

        // Get created worker
        const [workers] = await promisePool.query(
            'SELECT id, name, phone, email, address, role, created_at FROM workers WHERE id = $1',
            [result[0].id]
        );

        res.status(201).json({
            success: true,
            message: 'FLW registered successfully',
            data: {
                worker: workers[0],
                tempPassword: randomPassword // Return temp password to show to admin
            }
        });
    } catch (error) {
        console.error('Register FLW error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during FLW registration'
        });
    }
};

// @route   GET /api/workers/list
// @desc    Get all FLWs
// @access  Private (Admin only)
const getAllFlws = async (req, res) => {
    try {
        const [workers] = await promisePool.query(
            'SELECT id, name, phone, email, address, role, created_at FROM workers WHERE role = $1 ORDER BY created_at DESC',
            ['flw']
        );

        res.json({
            success: true,
            count: workers.length,
            data: workers
        });
    } catch (error) {
        console.error('Get FLWs error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching FLWs'
        });
    }
};

module.exports = {
    registerFlw,
    getAllFlws
};
