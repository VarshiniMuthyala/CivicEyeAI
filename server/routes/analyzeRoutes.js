import { Router } from 'express';
import { analyzeImage } from '../controllers/analyzeController.js';
import { upload } from '../middleware/upload.js';
import { analyzeLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// POST /api/analyze - Accepts image upload, sends to Gemini Vision API, returns structured JSON
router.post('/', analyzeLimiter, upload.single('image'), analyzeImage);

export default router;
