
const { CloudClient } = require("chromadb");

// Ensure all required environment variables are present
if (!process.env.CHROMA_API_KEY || !process.env.CHROMA_TENANT || !process.env.CHROMA_DATABASE) {
    throw new Error("Missing ChromaDB environment variables. Please check your .env file.");
}

// Initialize the ChromaDB Cloud client with credentials from environment variables
const client = new CloudClient({
  apiKey: process.env.CHROMA_API_KEY,
  tenant: process.env.CHROMA_TENANT,
  database: process.env.CHROMA_DATABASE
});

module.exports = client;
