const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

router.get('/stats', analyticsController.getStats);
router.get('/distributions', analyticsController.getDistributions);
router.get('/growth', analyticsController.getGrowthTrends);
router.get('/alerts', analyticsController.getImbalanceAlerts);

module.exports = router;
