const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');

router.post('/sync', registrationController.syncRegistration);
router.get('/list', registrationController.getAllRegistrations);

module.exports = router;
