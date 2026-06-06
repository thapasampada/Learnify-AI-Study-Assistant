import Flashcard from '../models/Flashcard.js';

export const createFlashcard = async (req, res, next) => {
  try {
    const { front, back, tags, document } = req.body;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const card = await Flashcard.create({ user: userId, front, back, tags, document });
    res.status(201).json({ success: true, data: card });
  } catch (err) {
    next(err);
  }
};

// Create multiple flashcards for a document (bulk)
export const createBulkFlashcards = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { documentId } = req.params;
    const { cards } = req.body; // expect array of { front, back, tags }

    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });
    if (!Array.isArray(cards) || cards.length === 0) {
      return res.status(400).json({ success: false, error: 'cards must be a non-empty array' });
    }

    const docs = cards.map((c) => ({
      user: userId,
      front: c.front,
      back: c.back,
      tags: c.tags || [],
      document: documentId || c.document || null,
    }));

    const created = await Flashcard.insertMany(docs);
    res.status(201).json({ success: true, count: created.length, data: created });
  } catch (err) {
    next(err);
  }
};

export const listFlashcards = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { tag, archived } = req.query;
    const filter = { user: userId };
    if (tag) filter.tags = tag;
    if (archived !== undefined) filter.archived = archived === 'true';

    const cards = await Flashcard.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: cards });
  } catch (err) {
    next(err);
  }
};

export const getFlashcard = async (req, res, next) => {
  try {
    const card = await Flashcard.findById(req.params.id);
    if (!card) return res.status(404).json({ success: false, error: 'Flashcard not found' });
    res.json({ success: true, data: card });
  } catch (err) {
    next(err);
  }
};

export const updateFlashcard = async (req, res, next) => {
  try {
    const updates = req.body;
    const card = await Flashcard.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!card) return res.status(404).json({ success: false, error: 'Flashcard not found' });
    res.json({ success: true, data: card });
  } catch (err) {
    next(err);
  }
};

export const deleteFlashcard = async (req, res, next) => {
  try {
    const card = await Flashcard.findByIdAndDelete(req.params.id);
    if (!card) return res.status(404).json({ success: false, error: 'Flashcard not found' });
    res.json({ success: true, message: 'Flashcard deleted' });
  } catch (err) {
    next(err);
  }
};

// Record a review/answer for a flashcard
export const reviewFlashcard = async (req, res, next) => {
  try {
    const { correct, difficulty } = req.body;
    const card = await Flashcard.findById(req.params.id);
    if (!card) return res.status(404).json({ success: false, error: 'Flashcard not found' });

    // update difficulty if provided
    if (difficulty && ['easy', 'medium', 'hard'].includes(difficulty)) {
      card.difficulty = difficulty;
    }

    card.reviewCount = (card.reviewCount || 0) + 1;
    card.lastReviewed = new Date();

    // simple scheduling: double interval when correct, reset to 1 when incorrect
    const prev = card.intervalDays || 1;
    const nextInterval = correct ? Math.max(1, Math.round(prev * 2)) : 1;
    card.intervalDays = nextInterval;
    card.nextReview = new Date(Date.now() + nextInterval * 24 * 60 * 60 * 1000);

    await card.save();
    res.json({ success: true, data: { nextReview: card.nextReview, reviewCount: card.reviewCount } });
  } catch (err) {
    next(err);
  }
};
