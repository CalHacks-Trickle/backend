
const DailyUsage = require('../models/daily-usage.model.js');

/**
 * Builds the detailed status payload with real data for the user.
 * @param {string} userEmail - The email of the user to build the payload for.
 * @param {string} classification - The user's current app's classification.
 * @returns {Promise<object>} The full status object for the client.
 */
async function buildStatusPayload(userEmail, classification) {
    const today = new Date().toISOString().split('T')[0];
    const usageRecords = await DailyUsage.getForDay(userEmail, today);

    const sessionSummary = {
        totalFocusTime: 0,
        totalDistractionTime: 0,
        longestFocusStreak: 0, // This logic is not yet implemented
        lastUpdated: new Date().toISOString()
    };

    const appUsage = {
        focus: { totalTime: 0, apps: [] },
        distraction: { totalTime: 0, apps: [] }
    };

    const appTimeMap = {};

    for (const record of usageRecords) {
        const { appName, classification: recordClassification, duration } = record;

        if (recordClassification === 'focusing') {
            sessionSummary.totalFocusTime += duration;
        } else {
            sessionSummary.totalDistractionTime += duration;
        }

        if (!appTimeMap[appName]) {
            appTimeMap[appName] = { name: appName, time: 0, classification: recordClassification };
        }
        appTimeMap[appName].time += duration;
    }

    // Convert the map to the final array structure for appUsage
    for (const appName in appTimeMap) {
        const appData = appTimeMap[appName];
        const category = appData.classification === 'focusing' ? 'focus' : 'distraction';
        appUsage[category].apps.push({ name: appData.name, time: appData.time });
        appUsage[category].totalTime += appData.time;
    }

    // Sort apps by time spent
    appUsage.focus.apps.sort((a, b) => b.time - a.time);
    appUsage.distraction.apps.sort((a, b) => b.time - a.time);

    const payload = {
        currentState: classification || 'distracting',
        sessionSummary,
        appUsage
    };

    return payload;
}

module.exports = { buildStatusPayload };
