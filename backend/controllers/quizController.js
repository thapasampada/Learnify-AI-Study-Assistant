import Quiz from '../models/Quiz.js';

// Create a new quiz
export const createQuiz = async (req, res, next) => {
  try {
    const { document, title, questions } = req.body;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const quiz = await Quiz.create({
      user: userId,
      document,
      title,
      questions,
      totalQuestions: questions?.length || 0,
    });

    res.status(201).json({ success: true, data: quiz });
  } catch (err) {
    next(err);
  }
};

// Get quiz by id (without exposing correct answers)
export const getQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id).lean();
    if (!quiz) return res.status(404).json({ success: false, error: 'Quiz not found' });

    // remove correctAnswer fields before sending to client
    const safeQuestions = quiz.questions.map((q) => ({
      question: q.question,
      options: q.options,
      explanation: q.explanation,
      difficulty: q.difficulty,
    }));

    res.json({ success: true, data: { ...quiz, questions: safeQuestions } });
  } catch (err) {
    next(err);
  }
};

// Submit answers and calculate score
export const submitQuiz = async (req, res, next) => {
  try {
    const { answers } = req.body; // [{ questionIndex, selectedAnswer }]
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ success: false, error: 'Quiz not found' });

    let score = 0;
    const userAnswers = answers.map((a) => {
      const q = quiz.questions[a.questionIndex];
      const isCorrect = q && q.correctAnswer === a.selectedAnswer;
      if (isCorrect) score += 1;
      return {
        questionIndex: a.questionIndex,
        selectedAnswer: a.selectedAnswer,
        isCorrect,
      };
    });

    quiz.userAnswers = userAnswers;
    quiz.score = score;
    await quiz.save();

    res.json({ success: true, data: { score, total: quiz.totalQuestions } });
  } catch (err) {
    next(err);
  }
};

export const listUserQuizzes = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const quizzes = await Quiz.find({ user: userId });
    res.json({ success: true, data: quizzes });
  } catch (err) {
    next(err);
  }
};
