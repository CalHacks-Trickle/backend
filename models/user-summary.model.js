
const client = require('../db/chroma');
const { DefaultEmbeddingFunction } = require('@chroma-core/default-embed');

const COLLECTION_NAME = "user_summaries";
const embedder = new DefaultEmbeddingFunction();

async function getSummaryCollection() {
    // FIX: Added the required embedding function
    return await client.getOrCreateCollection({ 
        name: COLLECTION_NAME,
        embeddingFunction: embedder
    });
}

async function upsertSummary(userEmail, date, totalFocusTime, totalDistractionTime) {
    const collection = await getSummaryCollection();
    const recordId = `${userEmail}-${date}`;

    await collection.upsert({
        ids: [recordId],
        metadatas: [{
            userEmail,
            date,
            totalFocusTime,
            totalDistractionTime
        }],
        documents: [`Summary for ${userEmail} on ${date}`]
    });
}

const UserSummary = {
    upsert: upsertSummary,
};

module.exports = UserSummary;
