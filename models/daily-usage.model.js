
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
        // FIX: Reduce limit to be within the cloud quota (300)
        limit: 300
    });
    return results.metadatas || [];
}

async function getAllUsageForDate(date) {
    const collection = await getUsageCollection();
    const results = await collection.get({
        where: { "date": { "$eq": date } },
        limit: 100000
    });
    return results.metadatas || [];
}

async function deleteUsageForDay(date) {
    const collection = await getUsageCollection();
    const recordsToDelete = await collection.get({
        where: { "date": { "$eq": date } },
        limit: 100000
    });

    if (recordsToDelete.ids.length > 0) {
        await collection.delete({ ids: recordsToDelete.ids });
        console.log(`Deleted ${recordsToDelete.ids.length} daily usage records for date: ${date}`);
    }
}

const DailyUsage = {
    add: addUsage,
    getForDay: getUsageForDay,
    getAllForDate: getAllUsageForDate,
    deleteForDay: deleteUsageForDay,
};

module.exports = DailyUsage;
