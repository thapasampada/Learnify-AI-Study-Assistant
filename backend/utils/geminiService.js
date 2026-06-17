import dotenv from "dotenv";
// dynamic import of @google/genai to avoid crash when package is not installed

dotenv.config();

const hasKey = Boolean(process.env.GEMINI_API_KEY);
let ai = null;
if (hasKey) {
  try {
    const genai = await import('@google/genai');
    const { GoogleGenAI } = genai;
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  } catch (err) {
    console.warn(
      "@google/genai package not found or failed to load. Install it to enable Gemini features. Falling back to mock responses."
    );
    ai = null;
  }
} else {
  console.warn(
    "Warning: GEMINI_API_KEY is not set. Gemini features will return mock responses."
  );
}

/**
 * Generate a multiple-choice quiz from text
 * @param {string} text - Document text
 * @param {number} numQuestions - Number of questions to generate
 * @returns {Promise<Array<{question: string, options: object, correct: string, explanation?: string, difficulty: string}>>}
 */
export const generateQuiz = async (text, numQuestions = 5) => {
  if (!ai) {
    console.warn("GEMINI_API_KEY not set - returning mock quiz.");
    const mock = [];
    for (let i = 0; i < numQuestions; i++) {
      mock.push({
        question: `Mock question ${i + 1} from text`,
        options: { A: "Option A", B: "Option B", C: "Option C", D: "Option D" },
        correct: "A",
        explanation: "This is a mock explanation. Set GEMINI_API_KEY to get real questions.",
        difficulty: "medium",
      });
    }
    return mock;
  }
  const prompt = `Generate exactly ${numQuestions} multiple choice questions from the following text.
Format each question exactly in this format (use the labels shown):

Q: [Question]
A: [Option A]
B: [Option B]
C: [Option C]
D: [Option D]
Key: [A|B|C|D]
Explanation: [Brief explanation]
Difficulty: [easy|medium|hard]

Separate each question block with exactly four dashes: ----

Text:
${text ? text.substring(0, 15000) : ""}
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    // response shape may vary; try common properties then fallback to .text
    const generatedText =
      (response && (response.outputText || response.text || response?.output?.[0]?.content?.[0]?.text)) ||
      "";

    const cards = generatedText
      .split("----")
      .map((c) => c.trim())
      .filter(Boolean);

    const quiz = [];

    for (const card of cards) {
      const lines = card.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

      let question = "";
      const options = {};
      let correct = "";
      let explanation = "";
      let difficulty = "medium";

      for (const line of lines) {
        if (line.startsWith("Q:")) {
          question = line.substring(2).trim();
        } else if (/^[A-D]:/.test(line)) {
          const key = line[0];
          options[key] = line.substring(2).trim();
        } else if (line.toLowerCase().startsWith("key:")) {
          correct = line.substring(4).trim();
        } else if (line.toLowerCase().startsWith("explanation:")) {
          explanation = line.substring(12).trim();
        } else if (line.toLowerCase().startsWith("difficulty:")) {
          const d = line.substring(11).trim().toLowerCase();
          if (["easy", "medium", "hard"].includes(d)) difficulty = d;
        }
      }

      if (question && Object.keys(options).length >= 2) {
        quiz.push({
          question,
          options,
          correct,
          explanation,
          difficulty,
        });
      }
    }

    return quiz.slice(0, numQuestions);
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to generate quiz");
  }
};

export const ask = async (prompt) => {
  if (!ai) {
    console.warn("GEMINI_API_KEY not set - returning mock answer.");
    return `Mock answer: ${prompt.substring(0, 200)}`;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5",
      contents: `Answer concisely:\n${prompt}`,
    });

    return (response && (response.outputText || response.text || response?.output?.[0]?.content?.[0]?.text)) || "";
  } catch (error) {
    console.error("Gemini ask error:", error);
    throw new Error("Failed to get AI response");
  }
};

export const summarize = async (text) => {
  if (!ai) {
    console.warn("GEMINI_API_KEY not set - returning mock summary.");
    return text ? `${text.substring(0, 300)}${text.length > 300 ? '... (mock summary)' : ''}` : '';
  }

  try {
    const prompt = `Summarize the following text concisely:\n\n${text.substring(0, 15000)}`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5",
      contents: prompt,
    });

    return (response && (response.outputText || response.text || response?.output?.[0]?.content?.[0]?.text)) || "";
  } catch (error) {
    console.error("Gemini summarize error:", error);
    throw new Error("Failed to summarize text");
  }
};

export const generateFlashcards = async (text, maxCards = 10) => {
  if (!ai) {
    console.warn("GEMINI_API_KEY not set - returning mock flashcards.");
    const sentences = text ? text.split(/(?<=[.!?])\s+/) : [];
    const cards = sentences.slice(0, maxCards).map((s, i) => ({
      question: `What is the main idea of sentence ${i + 1}?`,
      answer: s.substring(0, 250),
      difficulty: "easy",
    }));
    return cards;
  }

  const prompt = `Generate up to ${maxCards} concise flashcards from the text below.\n
Format each flashcard as:\nQ: [Question]\nA: [Answer]\nDifficulty: [easy|medium|hard]\n----\n\n${text ? text.substring(0, 15000) : ""}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    const generatedText =
      (response && (response.outputText || response.text || response?.output?.[0]?.content?.[0]?.text)) || "";

    const cards = generatedText
      .split("----")
      .map((c) => c.trim())
      .filter(Boolean)
      .slice(0, maxCards)
      .map((card) => {
        const lines = card.split(/\r?\n/).map((l) => l.trim());
        let q = "", a = "", difficulty = "medium";
        for (const line of lines) {
          if (line.startsWith("Q:")) q = line.substring(2).trim();
          else if (line.startsWith("A:")) a = line.substring(2).trim();
          else if (line.toLowerCase().startsWith("difficulty:")) {
            const d = line.substring(11).trim().toLowerCase();
            if (["easy","medium","hard"].includes(d)) difficulty = d;
          }
        }
        return { question: q, answer: a, difficulty };
      });

    return cards;
  } catch (error) {
    console.error("Gemini flashcards error:", error);
    throw new Error("Failed to generate flashcards");
  }
};

export default {
  ask,
  summarize,
  generateFlashcards,
  generateQuiz,
};