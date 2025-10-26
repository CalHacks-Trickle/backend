
const { io } = require("socket.io-client");
const http = require('http');

// --- CONFIGURATION ---
const JWT_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImVtYWlsIjoidGVzdC11c2VyQHRyaWNrbGUuYXBwIn0sImlhdCI6MTc2MTQyODg2MSwiZXhwIjoxNzYxNjg4MDYxfQ.IjZSkaGfgTeRs7oyHOErKhCN6d0IpI_csJ2YiKciVBA";

/**
 * Parses the --app="AppName" command-line argument.
 * @returns {string} The app name from the arguments or a default value.
 */
function getAppFromArgs() {
    const arg = process.argv.find(arg => arg.startsWith('--app='));
    if (arg) {
        // Returns the part after '--app=' and removes any surrounding quotes
        return arg.split('=')[1].replace(/^"|"$/g, '');
    }
    return "Terminal"; // Default app to test if none is provided
}

const APP_TO_TEST = getAppFromArgs();
// ---------------------

function verifyClassification() {
    console.log(`\n🔎 Verifying classification for '${APP_TO_TEST}' via API...`);

    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/live-app',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${JWT_TOKEN}` }
    };

    const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
            try {
                const responseBody = JSON.parse(data);
                if (res.statusCode === 200) {
                    console.log("✅ API Verification Successful:", responseBody);
                } else {
                    console.error("❌ API Verification Failed:", res.statusCode, responseBody);
                }
            } catch (e) {
                 console.error("❌ Failed to parse API response:", data);
            }
        });
    });

    req.on('error', (error) => { console.error('❌ HTTP Request Error:', error); });
    req.end();
}

const socket = io("http://20.172.68.176:3000", { auth: { token: JWT_TOKEN } });

socket.on("connect", () => {
    console.log("✅ Connected to server successfully!");

    setTimeout(() => {
        console.log(`\n🚀 Sending app update: '${APP_TO_TEST}'`);
        socket.emit("update-app", { appName: APP_TO_TEST });
    }, 1000);

    setTimeout(verifyClassification, 4000);

    setTimeout(() => {
        console.log("\n🔌 Disconnecting...");
        socket.disconnect();
    }, 6000);
});

socket.on("connect_error", (err) => { console.error("❌ Connection Error:", err.message); });
socket.on("disconnect", () => { console.log("🔌 Disconnected from server."); });
