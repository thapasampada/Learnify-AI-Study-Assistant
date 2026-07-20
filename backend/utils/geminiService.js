import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error('GEMINI_API_KEY is not set in the environment variables.');
    process.exit(1);
}

const ai = new GoogleGenAI({
    apiKey,
});

const safeText = (value = '') => (typeof value === 'string' ? value : '');

const callGemini = async (prompt) => {
    const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: prompt,
    });
    return response.text ?? '';
};

/**
 * Generate flashcards from text
 * @param {string} text - Document text
 * @param {number} count - Number of flashcards to generate
 * @returns {Promise<Array<{question: string, answer: string, difficulty: string}>>}
 */
export const generateFlashcards = async (text, count = 10) => {
    const sourceText = safeText(text);
    const prompt = `Generate exactly ${count} educational flashcards from the following text.

Format each flashcard EXACTLY like this, with no extra commentary, headers, numbering, or markdown:

Q: <question text>
A: <answer text>
D: <easy|medium|hard>

Separate each flashcard with a line containing only ---

Text:
${sourceText.substring(0, 15000)}`;

    try {
        const generatedText = await callGemini(prompt);
        console.log('RAW GEMINI OUTPUT:', generatedText);

        const flashcards = [];
        const cards = generatedText.split('---').filter((c) => c.trim());

        for (const card of cards) {
            const lines = card.trim().split('\n');
            let question = '';
            let answer = '';
            let difficulty = 'medium';

            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('Q:')) {
                    question = trimmed.substring(2).trim();
                } else if (trimmed.startsWith('A:')) {
                    answer = trimmed.substring(2).trim();
                } else if (trimmed.startsWith('D:')) {
                    const diff = trimmed.substring(2).trim().toLowerCase();
                    if (['easy', 'medium', 'hard'].includes(diff)) {
                        difficulty = diff;
                    }
                }
            }

            if (question && answer) {
                flashcards.push({ question, answer, difficulty });
            }
        }

        return flashcards.slice(0, count);
    } catch (error) {
        console.error('Gemini API error:', error);
        throw new Error('Failed to generate flashcards.');
    }
};

/**
 * Generate quiz questions from text
 * @param {string} text - Document text
 * @param {number} count - Number of quiz questions to generate
 * @returns {Promise<Array<{question: string, options: Array<string>, correctAnswer: string, explanation: string, difficulty: string}>>}
 */
export const generateQuiz = async (text, numQuestions = 5) => {
    const sourceText = safeText(text);
    const prompt = `Generate exactly ${numQuestions} multiple-choice questions from the following text.
    Format each question as:
    Q: [Question 1]
    01: [Option 1]
    02: [Option 2]
    03: [Option 3]
    04: [Option 4]
    Answer: [Correct Option Number - exactly as written above]
    Explanation: [Explanation for the correct answer]
    Difficulty: [easy | medium | hard]
    
    Separate questions with "---"

    Text: ${sourceText.substring(0, 15000)}`;

    try {
        const generatedText = await callGemini(prompt);
        const quizQuestions = [];
        const questions = generatedText.split('---').filter((q) => q.trim());

        for (const block of questions) {
            const lines = block.trim().split('\n');
            let question = '';
            let options = [];
            let correctAnswer = '';
            let explanation = '';
            let difficulty = 'medium';

            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('Q:')) {
                    question = trimmed.substring(2).trim();
                } else if (trimmed.match(/^0\d:/)) {
                    options.push(trimmed.substring(3).trim());
                } else if (trimmed.startsWith('Answer:')) {
                    correctAnswer = trimmed.substring(7).trim();
                } else if (trimmed.startsWith('Explanation:')) {
                    explanation = trimmed.substring(12).trim();
                } else if (trimmed.startsWith('Difficulty:')) {
                    const diff = trimmed.substring(11).trim().toLowerCase();
                    if (['easy', 'medium', 'hard'].includes(diff)) {
                        difficulty = diff;
                    }
                }
            }

            if (question && options.length === 4 && correctAnswer && explanation) {
                quizQuestions.push({ question, options, correctAnswer, explanation, difficulty });
            }
        }

        return quizQuestions.slice(0, numQuestions);
    } catch (error) {
        console.error('Gemini API error:', error);
        throw new Error('Failed to generate quiz questions.');
    }
};

/**
 * Generate a summary from text
 * @param {string} text - Document text
 * @returns {Promise<string>} - Summary of the text
 */
export const generateSummary = async (text) => {
    const sourceText = safeText(text);
    const prompt = `Summarize the following text in a concise manner, highlighting key points and main ideas and keep the summary clear and structured.
    Return ONLY the summary, with no extra commentary.

    Text: ${sourceText.substring(0, 15000)}`;

    try {
        return await callGemini(prompt);
    } catch (error) {
        console.error('Gemini API error:', error);
        throw new Error('Failed to generate summary.');
    }
};

/**
 * Chat with document content
 * @param {string} question - User question
 * @param {Array<{content: string}>} chunks - Relevant document chunks
 * @returns {Promise<string>}
 */
export const chatWithDocument = async (question, chunks = []) => {
    const context = (chunks || []).map((c, i) => `[Chunk ${i + 1}]\n${c.content}`).join('\n\n');

    const prompt = `Based on the following context from a document, analyze the context and answer the user's question.
    If the answer is not present in the context, respond with "I don't know".
    
    Context:
    ${context}
    
    Question: ${question}
    Answer:`;

    try {
        return await callGemini(prompt);
    } catch (error) {
        console.error('Gemini API error:', error);
        throw new Error('Failed to process chat request.');
    }
};

/**
 * Explain a specific context or concept from document content
 * @param {string} concept - Concept to explain
 * @param {string} context - Relevant context
 * @returns {Promise<string>}
 */
export const explainConcept = async (concept, context) => {
    const prompt = `Explain the concept of "${concept}" based on the following context.
    Provide a clear, educational explanation that's easy to understand.
    Include examples if applicable. If the concept is not present in the context, respond with "I don't know".
    
    Context:
    ${safeText(context).substring(0, 15000)}`;

    try {
        return await callGemini(prompt);
    } catch (error) {
        console.error('Gemini API error:', error);
        throw new Error('Failed to explain concept.');
    }
};