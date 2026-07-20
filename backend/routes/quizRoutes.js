import express from 'express';
import {
    getQuizzes,
    getQuizById,
    SubmitQuiz,
    getQuizResults,
    deleteQuiz
} from '../controllers/quizController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/:documentId', getQuizzes);
router.get('/quiz/:id', getQuizById);
router.post('/:id/submit', SubmitQuiz);
router.get('/:id/results', getQuizResults);
router.delete('/:id', deleteQuiz);

export default router;