const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');

router.post('/sync', registrationController.syncRegistration);

module.exports = router;
