const { GoogleGenAI } = require('@google/genai');

let aiClient = null;

const initAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey.trim() !== '' && apiKey !== 'your_google_gemini_api_key_here') {
    try {
      aiClient = new GoogleGenAI({ apiKey });
    } catch (err) {
      aiClient = null;
    }
  }
};

const getAiClient = () => aiClient;

const isAiConfigured = () => !!aiClient;

module.exports = {
  initAI,
  getAiClient,
  isAiConfigured
};
