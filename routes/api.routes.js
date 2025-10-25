
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware.js');
const liveApps = require('../state/live-apps');

/**
 * @route   GET /api/live-app
 * @desc    Get the current application the user is on (for testing)
 * @access  Private
 */
router.get('/live-app', authMiddleware, (req, res) => {
    // The authMiddleware has already validated the user and attached it to req.user
    const userEmail = req.user.email;

    const currentApp = liveApps.get(userEmail);

    if (currentApp) {
        res.json({ appName: currentApp });
    } else {
        // This could mean the user is connected but hasn't sent an 'update-app' event yet,
        // or they are not connected via WebSocket.
        res.status(404).json({ error: 'Live application for user not found.' });
    }
});

module.exports = router;
