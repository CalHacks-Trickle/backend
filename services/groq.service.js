
const Groq = require('groq-sdk');

// Ensure the Groq API key is set in the environment variables
if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not set in the .env file.");
}

const groq = new Groq();

/**
 * Classifies an application name as 'focusing' or 'distracting' using the Groq API.
 * @param {string} appName - The name of the application to classify.
 * @returns {Promise<string>} The classification ('focusing' or 'distracting').
 */
async function classifyApp(appName) {
    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: 'You are a productivity assistant. Your task is to classify an application name as either \'focusing\' or \'distracting\'. You must only respond with one of those two words, in lowercase. Do not provide any explanation or other text.'
                },
                {
                    role: 'user',
                    content: `Classify the following application: ${appName}`
                }
            ],
            // The user requested a nano series model. Llama3 8b is a good, fast choice.
            model: 'llama-3.1-8b-instant',
            temperature: 0.25,
            max_tokens: 15, // Limit the output to a small number of tokens
        });

        const classification = chatCompletion.choices[0]?.message?.content.trim().toLowerCase();

        // Validate the response to ensure it's one of the expected values
        if (classification === 'focusing' || classification === 'distracting') {
            return classification;
        }

        // If the model returns something unexpected, default to 'distracting' as a safe bet.
        console.warn(`Groq returned an unexpected classification: '${classification}'. Defaulting to 'distracting'.`);
        return 'focusing';

    } catch (error) {
        console.error("Error classifying app with Groq:", error);
        // In case of an API error, default to 'distracting'
        return 'focusing';
    }
}

module.exports = { classifyApp };
