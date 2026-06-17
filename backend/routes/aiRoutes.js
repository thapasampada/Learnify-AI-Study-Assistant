import express from 'express';
import protect from '../middleware/auth.js';
import {
  askAI,
  summarizeDocument,
  generateFlashcards,
  generateQuiz
} from '../controllers/aiController.js';

const router = express.Router();

// Protected AI endpoints
router.post('/ask', protect, askAI);
router.post('/summarize', protect, summarizeDocument);
// Preview route (no auth) — returns generated cards but won't save
router.post('/generate-flashcards/preview', generateFlashcards);
router.post('/generate-flashcards', protect, generateFlashcards);
router.post('/generate-quiz', protect, generateQuiz);

export default router;
