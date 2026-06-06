import mongoose from 'mongoose';

const { Schema } = mongoose;

const optionValidator = [
  (arr) => Array.isArray(arr) && arr.length === 4,
  'Must have exactly 4 options',
];

const questionSchema = new Schema({
  question: { type: String, required: true },
  options: { type: [String], required: true, validate: optionValidator },
  correctAnswer: { type: String, required: true },
  explanation: { type: String, default: '' },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
});

const userAnswerSchema = new Schema(
  {
    questionIndex: { type: Number, required: true },
    selectedAnswer: { type: String, required: true },
    isCorrect: { type: Boolean, required: true },
    answeredAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const quizSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    document: { type: Schema.Types.ObjectId, ref: 'Document' },
    title: { type: String, required: true, trim: true },
    questions: { type: [questionSchema], default: [] },
    userAnswers: { type: [userAnswerSchema], default: [] },
    score: { type: Number, default: 0 },
    totalQuestions: { type: Number, required: true },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

quizSchema.index({ user: 1, document: 1 });

const Quiz = mongoose.model('Quiz', quizSchema);

export default Quiz;






























c