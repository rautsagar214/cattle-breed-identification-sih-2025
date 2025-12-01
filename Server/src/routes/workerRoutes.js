const express = require('express');
const router = express.Router();
const { registerFlw, getAllFlws } = require('../controllers/workerController');
const { authMiddleware } = require('../middleware/auth');

// Protect all routes with auth and admin middleware
const checkAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
    }
};

router.post('/register', authMiddleware, checkAdmin, registerFlw);
router.get('/list', authMiddleware, checkAdmin, getAllFlws);

module.exports = router;
