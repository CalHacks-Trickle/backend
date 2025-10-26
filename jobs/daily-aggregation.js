
const cron = require('node-cron');
const DailyUsage = require('../models/daily-usage.model.js');
const UserSummary = require('../models/user-summary.model.js');
const User = require('../models/user.model.js');

/**
 * Aggregates one user's daily data.
 */
async function aggregateDataForUser(userEmail, date) {
    const userUsage = await DailyUsage.getForDay(userEmail, date);

    if (userUsage.length === 0) {
        // This is normal, just means the user wasn't active.
        return;
    }

    let totalFocusTime = 0;
    let totalDistractionTime = 0;

    for (const record of userUsage) {
        if (record.classification === 'focusing') {
            totalFocusTime += record.duration;
        } else {
            totalDistractionTime += record.duration;
        }
    }

    await UserSummary.upsert(userEmail, date, totalFocusTime, totalDistractionTime);
    console.log(`Saved summary for ${userEmail} on ${date}: Focus=${totalFocusTime}s, Distraction=${totalDistractionTime}s`);
}

/**
 * Main aggregation job.
 */
async function runDailyAggregation(date) {
    console.log(`Starting daily aggregation for date: ${date}`);
    
    const allUsers = await User.getAll();
    if (allUsers.length === 0) {
        console.log("No users found to process.");
        return;
    }

    for (const user of allUsers) {
        // FIX 1: Add a guard to ensure the user object and email are valid
        if (user && user.email) {
            try {
                await aggregateDataForUser(user.email, date);
            } catch (error) {
                console.error(`Failed to aggregate data for user ${user.email}:`, error);
            }
        } else {
            console.warn("Skipping malformed user record:", user);
        }
    }

    console.log(`Finished aggregating data for ${date}.`);

    // FIX 2: Disable data deletion as requested.
    // console.log(`Data cleanup for ${date} is disabled for now.`);
    // await DailyUsage.deleteForDay(date);
}

function scheduleDailyAggregation() {
    cron.schedule('*/2 * * * *', () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const dateString = yesterday.toISOString().split('T')[0];
        
        console.log(`Triggering aggregation job for date: ${dateString}`);
        runDailyAggregation(dateString).catch(err => {
            console.error("Error during scheduled aggregation:", err);
        });
    }, {
        scheduled: true,
        timezone: "UTC"
    });

    console.log("Scheduled daily aggregation job to run every 2 minutes (for testing).");
}

module.exports = { scheduleDailyAggregation };
