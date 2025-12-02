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
            'INSERT INTO workers (name, phone, email, password, address, role, state, city, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
            [name, phone, email, hashedPassword, address || null, 'flw', state || null, city || null, 'active']
        );

        // Get created worker
        const [workers] = await promisePool.query(
            'SELECT id, name, phone, email, address, role, state, city, status, created_at FROM workers WHERE id = $1',
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
            'SELECT id, name, phone, email, address, role, state, city, status, created_at FROM workers WHERE role = $1 ORDER BY created_at DESC',
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

// @route   PUT /api/workers/update/:id
// @desc    Update FLW details (including status)
// @access  Private (Admin only)
const updateFlw = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone, email, state, city, address, status } = req.body;

        // Check if worker exists
        const [existing] = await promisePool.query('SELECT id FROM workers WHERE id = $1 AND role = $2', [id, 'flw']);
        if (existing.length === 0) {
            return res.status(404).json({ success: false, message: 'Worker not found' });
        }

        // Update query
        await promisePool.query(
            `UPDATE workers 
             SET name = $1, phone = $2, email = $3, state = $4, city = $5, address = $6, status = $7
             WHERE id = $8`,
            [name, phone, email, state, city, address, status, id]
        );

        // Get updated worker
        const [updatedWorker] = await promisePool.query(
            'SELECT id, name, phone, email, address, role, state, city, status, created_at FROM workers WHERE id = $1',
            [id]
        );

        res.json({
            success: true,
            message: 'FLW updated successfully',
            data: updatedWorker[0]
        });
    } catch (error) {
        console.error('Update FLW error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating FLW'
        });
    }
};

module.exports = {
    registerFlw,
    getAllFlws,
    updateFlw
};
