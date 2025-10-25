const { io } = require("socket.io-client");

// Replace with a valid token from your /login endpoint
const JWT_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImVtYWlsIjoidGVzdC11c2VyQHRyaWNrbGUuYXBwIn0sImlhdCI6MTc2MTQyODg2MSwiZXhwIjoxNzYxNjg4MDYxfQ.IjZSkaGfgTeRs7oyHOErKhCN6d0IpI_csJ2YiKciVBA";

// Connect to the server, passing the token for authentication
const socket = io("http://localhost:3000", {
    auth: {
        token: JWT_TOKEN
    }
});

socket.on("connect", () => {
    console.log("✅ Connected to server successfully!");

    // After 2 seconds, simulate the user switching to a new app
    setTimeout(() => {
        const currentApp = "Visual Studio Code";
        console.log(`\n🚀 Sending app update: ${currentApp}`);
        socket.emit("update-app", { appName: currentApp });
    }, 2000);

    // After 5 seconds, disconnect
    setTimeout(() => {
        console.log("\n🔌 Disconnecting...");
        socket.disconnect();
    }, 5000);
});

socket.on("connect_error", (err) => {
    console.error("❌ Connection Error:", err.message);
});

socket.on("disconnect", () => {
    console.log("🔌 Disconnected from server.");
});