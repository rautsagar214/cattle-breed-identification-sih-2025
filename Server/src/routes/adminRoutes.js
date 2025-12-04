const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/pending-evaluations', adminController.getPendingEvaluations);
router.get('/run/:id', adminController.getRunDetails);
router.post('/approve-image', adminController.approveImage);
router.post('/reject-image', adminController.rejectImage);
router.get('/approved-samples', adminController.getApprovedSamples);
router.get('/rejected-samples', adminController.getRejectedSamples);

module.exports = router;
