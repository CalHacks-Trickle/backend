
// This Map will store the detailed live session for each user.
// Key: user email (e.g., 'test-user@trickle.app')
// Value: { appName: string, classification: string, startTime: Date }
const liveSessions = new Map();

module.exports = liveSessions;
