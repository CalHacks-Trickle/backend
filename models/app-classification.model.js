
const client = require('../db/chroma');
const { DefaultEmbeddingFunction } = require('@chroma-core/default-embed');

const COLLECTION_NAME = "app_classifications";
const embedder = new DefaultEmbeddingFunction();

async function getClassificationCollection() {
    return await client.getOrCreateCollection({
        name: COLLECTION_NAME,
        embeddingFunction: embedder,
    });
}

/**
 * Gets the classification for a given application name.
 * @param {string} appName - The name of the application.
 * @returns {Promise<string|null>} The classification ('focusing' or 'distracting') or null if not found.
 */
async function getClassification(appName) {
    const collection = await getClassificationCollection();
    const result = await collection.get({ ids: [appName.toLowerCase()], limit: 1 });

    if (result.ids.length > 0 && result.metadatas[0]?.classification) {
        return result.metadatas[0].classification;
    }
    return null;
}

/**
 * Saves the classification for an application name.
 * @param {string} appName - The name of the application.
 * @param {string} classification - The classification to save ('focusing' or 'distracting').
 */
async function saveClassification(appName, classification) {
    const collection = await getClassificationCollection();
    await collection.upsert({
        ids: [appName.toLowerCase()],
        documents: [appName], // The document content for embedding
        metadatas: [{ classification }],
    });
}

const AppClassification = {
    get: getClassification,
    save: saveClassification,
};

module.exports = AppClassification;
