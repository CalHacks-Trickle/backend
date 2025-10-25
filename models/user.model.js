
const bcrypt = require('bcryptjs');
const client = require('../db/chroma');
const { DefaultEmbeddingFunction } = require('@chroma-core/default-embed');

const COLLECTION_NAME = "users";
const embedder = new DefaultEmbeddingFunction();

/**
 * Initializes the ChromaDB client and gets or creates the 'users' collection,
 * configuring it with a default embedding function.
 */
async function getUserCollection() {
    return await client.getOrCreateCollection({
        name: COLLECTION_NAME,
        embeddingFunction: embedder,
    });
}

/**
 * Finds a user by their email address.
 * @param {string} email - The email of the user to find.
 * @returns {Promise<object|null>} The user object if found, otherwise null.
 */
async function findUserByEmail(email) {
    const collection = await getUserCollection();
    const result = await collection.get({
        ids: [email],
        limit: 1
    });

    if (result.ids.length > 0) {
        // ChromaDB stores all custom data in the 'metadatas' array.
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

/**
 * Creates a new user in the ChromaDB collection.
 * @param {object} userData - The user data.
 * @param {string} userData.email - The user's email.
 * @param {string} userData.password - The user's plain text password.
 * @returns {Promise<object>} The newly created user object (without password).
 */
async function createUser({ email, password }) {
    const collection = await getUserCollection();

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await collection.upsert({
        ids: [email],
        documents: [`user email: ${email}`], // This document will now be automatically embedded
        metadatas: [{
            password: hashedPassword,
            createdAt: new Date().toISOString(),
        }],
    });

    return { email };
}

const User = {
    findUserByEmail,
    create: createUser,
};

module.exports = User;
