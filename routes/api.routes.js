
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware.js');
const liveApps = require('../state/live-apps');
const DailyUsage = require('../models/daily-usage.model.js');

/**
 * @route   GET /api/live-app
 * @desc    Get the current application and its classification for the user
 * @access  Private
 */
router.get('/live-app', authMiddleware, (req, res) => {
    const userEmail = req.user.email;
    const liveAppInfo = liveApps.get(userEmail);

    if (liveAppInfo) {
        res.json(liveAppInfo);
    } else {
        res.status(404).json({ error: 'Live application for user not found.' });
    }
});

/**
 * @route   GET /api/usage/today
 * @desc    Get a detailed report of the user's app usage for the current day.
 * @access  Private
 */
router.get('/usage/today', authMiddleware, async (req, res) => {
    try {
        const userEmail = req.user.email;
        const today = new Date().toISOString().split('T')[0];

        const usageRecords = await DailyUsage.getForDay(userEmail, today);

        // Process the records into the desired format for the frontend
        const report = {
            focus: { totalTime: 0, apps: [] },
            distraction: { totalTime: 0, apps: [] }
        };

        const appTimeMap = {};

        for (const record of usageRecords) {
            const { appName, classification, duration } = record;

            if (classification === 'focusing') {
                report.focus.totalTime += duration;
            } else {
                report.distraction.totalTime += duration;
            }

            if (!appTimeMap[appName]) {
                appTimeMap[appName] = { name: appName, time: 0, classification };
            }
            appTimeMap[appName].time += duration;
        }

        // Convert the map to the final array structure
        for (const appName in appTimeMap) {
            const appData = appTimeMap[appName];
            if (appData.classification === 'focusing') {
                report.focus.apps.push({ name: appData.name, time: appData.time });
            } else {
                report.distraction.apps.push({ name: appData.name, time: appData.time });
            }
        }

        res.json(report);

    } catch (error) {
        console.error("Error fetching today's usage:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
