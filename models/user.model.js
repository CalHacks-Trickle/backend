
const bcrypt = require('bcryptjs');
const client = require('../db/chroma');
const { DefaultEmbeddingFunction } = require('@chroma-core/default-embed');

const COLLECTION_NAME = "users";
const embedder = new DefaultEmbeddingFunction();

async function getUserCollection() {
    return await client.getOrCreateCollection({
        name: COLLECTION_NAME,
        embeddingFunction: embedder,
    });
}

async function findUserByEmail(email) {
    const collection = await getUserCollection();
    const result = await collection.get({ ids: [email], limit: 1 });

    if (result.ids.length > 0) {
        const metadata = result.metadatas[0];
        if (metadata) {
            return {
                email: result.ids[0],
                password: metadata.password,
                createdAt: metadata.createdAt,
            };
        }
    }
    return null;
}

async function createUser({ email, password }) {
    const collection = await getUserCollection();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await collection.upsert({
        ids: [email],
        documents: [`user email: ${email}`],
        metadatas: [{ password: hashedPassword, createdAt: new Date().toISOString() }],
    });

    return { email };
}

/**
 * Fetches all users from the collection.
 * @returns {Promise<Array<object>>} A list of all user objects.
 */
async function getAllUsers() {
    const collection = await getUserCollection();
    // The .get() method with no IDs or where clause fetches all records, up to the limit.
    const results = await collection.get({ limit: 10000 }); // Set a reasonable limit for total users
    return results.metadatas || [];
}

const User = {
    findUserByEmail,
    create: createUser,
    getAll: getAllUsers, // Expose the new function
};

module.exports = User;
