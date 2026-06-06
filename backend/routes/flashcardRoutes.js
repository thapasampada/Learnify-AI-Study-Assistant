import express from 'express';
import protect from '../middleware/auth.js';
import {
  createFlashcard,
  listFlashcards,
  getFlashcard,
  updateFlashcard,
  deleteFlashcard,
  createBulkFlashcards,
  reviewFlashcard,
} from '../controllers/flashcardController.js';

const router = express.Router();

router.use(protect);

router.post('/', createFlashcard);
router.post('/document/:documentId/cards', createBulkFlashcards);
router.post('/:id/review', reviewFlashcard);
router.get('/', listFlashcards);
router.get('/:id', getFlashcard);
router.put('/:id', updateFlashcard);
router.delete('/:id', deleteFlashcard);

export default router;
