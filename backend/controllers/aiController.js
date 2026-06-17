import Document from '../models/Document.js';
import geminiService from '../utils/geminiService.js';
import Flashcard from '../models/Flashcard.js';

// POST /api/ai/ask
export const askAI = async (req, res, next) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ success: false, error: 'Prompt is required' });

    const response = await geminiService.ask(prompt);
    return res.json({ success: true, data: response });
  } catch (err) {
    next(err);
  }
};
// POST /api/ai/summarize
export const summarizeDocument = async (req, res, next) => {
  try {
    const { documentId, text } = req.body;
    let content = text || '';
    if (documentId) {
      const doc = await Document.findById(documentId);
      if (!doc) return res.status(404).json({ success: false, error: 'Document not found' });
      content = doc.text || content;
    }
    if (!content) return res.status(400).json({ success: false, error: 'No text to summarize' });

    const summary = await geminiService.summarize(content);
    return res.json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
};

// POST /api/ai/generate-flashcards
export const generateFlashcards = async (req, res, next) => {
  try {
    const { text, maxCards = 10, documentId = null } = req.body;
    if (!text) return res.status(400).json({ success: false, error: 'Text is required' });

    const cards = await geminiService.generateFlashcards(text, maxCards);

    // If user is authenticated, save to DB; otherwise return generated cards (preview)
    if (req.user && req.user.id) {
      const docs = cards.map((c) => ({
        user: req.user.id,
        front: c.question || c.questionText || c.q || '',
        back: c.answer || c.a || c.answerText || '',
        difficulty: c.difficulty || 'medium',
        document: documentId || null,
      }));

      const saved = await Flashcard.insertMany(docs);
      return res.status(201).json({ success: true, data: saved, message: 'Flashcards generated and saved' });
    }

    // unauthenticated: return preview without saving
    return res.json({ success: true, data: cards });
  } catch (err) {
    next(err);
  }
};

// POST /api/ai/generate-quiz
export const generateQuiz = async (req, res, next) => {
  try {
    const { text, numQuestions = 5 } = req.body;
    if (!text) return res.status(400).json({ success: false, error: 'Text is required' });

    const quiz = await geminiService.generateQuiz(text, numQuestions);
    return res.json({ success: true, data: quiz });
  } catch (err) {
    next(err);
  }
};
// generate flsahcard using gemini
//save to database 

export default {
  askAI,
  summarizeDocument,
  generateFlashcards,
  generateQuiz
};
