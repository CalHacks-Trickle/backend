
const cron = require('node-cron');
const DailyUsage = require('../models/daily-usage.model.js');

/**
 * The main job to run daily. It clears out the previous day's detailed usage logs.
 * @param {string} date - The date to process, in YYYY-MM-DD format.
 */
async function runDailyCleanup(date) {
    console.log(`Starting daily cleanup for date: ${date}`);
    try {
        await DailyUsage.deleteForDay(date);
    } catch (error) {
        console.error(`Failed to delete usage data for date ${date}:`, error);
    }
}

/**
 * Schedules the daily cleanup job.
 */
function scheduleDailyJob() {
    // Schedule to run every day at 00:00 (midnight) UTC.
    cron.schedule('0 0 * * *', () => {
        // Calculate yesterday's date to ensure we are cleaning up completed days.
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const dateString = yesterday.toISOString().split('T')[0];
        
        console.log(`Triggering daily cleanup job for date: ${dateString}`);
        runDailyCleanup(dateString).catch(err => {
            console.error("Error during scheduled cleanup:", err);
        });
    }, {
        scheduled: true,
        timezone: "UTC"
    });

    console.log("Scheduled daily cleanup job to run at midnight UTC.");
}

// The function name is changed to reflect its new purpose.
module.exports = { scheduleDailyJob };
