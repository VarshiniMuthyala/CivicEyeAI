import { analyzeCivicImage } from '../services/geminiService.js';
import path from 'path';

export const analyzeImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'Please upload an image file (JPG, JPEG, PNG, WEBP) to analyze.'
      });
    }

    const language = req.body.language || req.query.language || 'en';
    const filePath = req.file.path;
    const mimeType = req.file.mimetype;

    const analysis = await analyzeCivicImage(filePath, mimeType, language);

    // Provide staged image URL for preview and submission
    const tempImageUrl = `/uploads/${path.basename(filePath)}`;

    return res.json({
      success: true,
      analysis,
      tempImageUrl
    });
  } catch (error) {
    console.error('Controller Analysis Error:', error.message);

    // If Gemini API Key is missing or invalid, return clear 503 / 400
    const isKeyError = error.message.includes('GEMINI_API_KEY') || error.message.includes('API_KEY');
    const isQuotaError = error.message.includes('quota') || error.message.includes('RESOURCE_EXHAUSTED');

    return res.status(isKeyError || isQuotaError ? 503 : 500).json({
      error: error.message,
      code: isKeyError ? 'GEMINI_KEY_REQUIRED' : isQuotaError ? 'GEMINI_QUOTA_EXCEEDED' : 'ANALYSIS_ERROR'
    });
  }
};
