
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware.js');
const liveApps = require('../state/live-apps');

/**
 * @route   GET /api/live-app
 * @desc    Get the current application and its classification for the user
 * @access  Private
 */
router.get('/live-app', authMiddleware, (req, res) => {
    const userEmail = req.user.email;

    const liveAppInfo = liveApps.get(userEmail);

    if (liveAppInfo) {
        res.json(liveAppInfo); // Returns { appName, classification }
    } else {
        res.status(404).json({ error: 'Live application for user not found.' });
    }
});

module.exports = router;
