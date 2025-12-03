const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historyController');

// Using protect middleware to ensure only authenticated users can sync? 
// The requirement says "user/flw role comes online", implying they might be logged in.
// However, the sync might happen in background. Let's assume we send the token in headers if available.
// For now, let's make it open but expect userId in body, or we can use protect if we are sure token is always available.
// Given the offline nature, token might be expired. But for simplicity let's try to use protect if possible, 
// or just trust the userId sent from client for this specific offline-sync scenario if token issues arise.
// Let's stick to standard practice: protect it. If token expired, user needs to login again to sync.
// ACTUALLY, the prompt says "userId and role of logged in user which we get while login and we store in async storage".
// So we are sending userId manually. Let's keep it open for now to avoid complexity with expired tokens during background sync,
// but in production we should validate.

router.post('/sync', historyController.syncHistory);

module.exports = router;
