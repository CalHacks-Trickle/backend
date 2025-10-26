
/**
 * Builds the detailed status payload to be sent to the client.
 * @param {string} classification - The user's current state ('focusing' or 'distracting').
 * @returns {object} The full status object for the client.
 */
function buildStatusPayload(classification) {
    // For now, we use the provided example data for unimplemented fields.
    // In the future, this function would calculate these values based on user activity logs.
    const payload = {
        garden: {
            tree: {
                level: 2,
                health: 95.5,
                progressToNextLevel: 67.3
            }
        },
        currentState: classification || 'focusing', // Default to focusing if null
        sessionSummary: {
            totalFocusTime: 7200,
            totalDistractionTime: 900,
            longestFocusStreak: 3600,
            lastUpdated: new Date().toISOString()
        },
        appUsage: {
            focus: {
                totalTime: 7200,
                apps: [
                    { "name": "Visual Studio Code", "time": 5400 },
                    { "name": "iTerm2", "time": 1200 },
                    { "name": "Figma", "time": 600 }
                ]
            },
            distraction: {
                totalTime: 900,
                apps: [
                    { "name": "Slack", "time": 600 },
                    { "name": "X", "time": 300 }
                ]
            }
        }
    };

    return payload;
}

module.exports = { buildStatusPayload };
