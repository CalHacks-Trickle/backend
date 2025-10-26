
const client = require('../db/chroma');
const { DefaultEmbeddingFunction } = require('@chroma-core/default-embed');

const COLLECTION_NAME = "daily_usage";
const embedder = new DefaultEmbeddingFunction();

async function getUsageCollection() {
    return await client.getOrCreateCollection({ 
        name: COLLECTION_NAME, 
        embeddingFunction: embedder 
    });
}

async function addUsage(userEmail, appName, classification, durationInSeconds) {
    const collection = await getUsageCollection();
    const recordId = `${userEmail}-${appName}-${Date.now()}`;

    await collection.add({
        ids: [recordId],
        metadatas: [{
            userEmail,
            appName,
            classification,
            duration: durationInSeconds,
            date: new Date().toISOString().split('T')[0]
        }],
        documents: [`Usage: ${appName} by ${userEmail}`]
    });
}

async function getUsageForDay(userEmail, date) {
    const collection = await getUsageCollection();
    const results = await collection.get({
        where: {
            "$and": [
                { "userEmail": { "$eq": userEmail } },
                { "date": { "$eq": date } }
            ]
        },
        limit: 300
    });
    return results.metadatas || [];
}

/**
 * Deletes all usage records for a given date using a direct where-filter.
 * This is more efficient and avoids quota errors.
 * @param {string} date - The date in YYYY-MM-DD format.
 */
async function deleteUsageForDay(date) {
    const collection = await getUsageCollection();
    // FIX: Use a direct delete with a 'where' clause to avoid fetching first.
    await collection.delete({ where: { "date": { "$eq": date } } });
    console.log(`Deleted daily usage records for date: ${date}`);
}

const DailyUsage = {
    add: addUsage,
    getForDay: getUsageForDay,
    deleteForDay: deleteUsageForDay,
};

module.exports = DailyUsage;
