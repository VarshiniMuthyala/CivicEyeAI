import dotenv from 'dotenv';
dotenv.config();

let genAIClient = null;
let googleGenAI = null;

// Initialize Google Gen AI
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== 'YOUR_GEMINI_API_KEY') {
    // Attempt to load @google/genai SDK
    try {
      const { GoogleGenAI } = await import('@google/genai');
      googleGenAI = new GoogleGenAI({ apiKey });
      console.log('✓ Google Gen AI SDK (@google/genai) initialized');
    } catch (e1) {
      // Fallback to @google/generative-ai
      try {
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        genAIClient = new GoogleGenerativeAI(apiKey);
        console.log('✓ Google Generative AI SDK (@google/generative-ai) initialized');
      } catch (e2) {
        console.warn('Neither @google/genai nor @google/generative-ai could be loaded yet:', e2.message);
      }
    }
  } else {
    console.warn('⚠️ GEMINI_API_KEY not configured in server/.env. AI calls will require the key to be set.');
  }
} catch (err) {
  console.error('Error initializing Gemini client:', err.message);
}

export const getGeminiClients = () => ({
  googleGenAI,
  genAIClient,
  apiKey: process.env.GEMINI_API_KEY,
  modelName: process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite'
});
