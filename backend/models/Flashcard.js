import mongoose from 'mongoose';

const { Schema } = mongoose;

const flashcardSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    front: { type: String, required: [true, 'Front text is required'], trim: true },
    back: { type: String, required: [true, 'Back text is required'], trim: true },
    tags: { type: [String], default: [] },
    document: { type: Schema.Types.ObjectId, ref: 'Document', default: null },
    archived: { type: Boolean, default: false },

    // Spaced repetition fields
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    lastReviewed: { type: Date, default: null },
    reviewCount: { type: Number, default: 0 },
    intervalDays: { type: Number, default: 1 },
    nextReview: { type: Date, default: null },
    isStarred: { type: Boolean, default: false },
  },
  { timestamps: true }
);

flashcardSchema.index({ user: 1, document: 1 });

const Flashcard = mongoose.model('Flashcard', flashcardSchema);

export default Flashcard;
