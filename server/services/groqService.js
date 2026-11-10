const Groq = require('groq-sdk');

const MODEL = 'openai/gpt-oss-120b';
const VALID_LEVELS = new Set(['eli5', 'teen', 'expert']);

const LEVEL_GUIDANCE = {
  eli5: 'Use very simple vocabulary, short sentences, and an everyday analogy suitable for a curious 5-year-old.',
  teen: 'Use clear, conversational language, relatable examples, and define necessary terminology for a teenager.',
  expert: 'Use precise technical language, mechanisms, assumptions, and useful nuance for an adult or domain expert.'
};

function getClient() {
  if (!process.env.GROQ_API_KEY) {
    const error = new Error('The AI service is not configured.');
    error.statusCode = 503;
    error.code = 'AI_NOT_CONFIGURED';
    throw error;
  }
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

function parseResponse(content) {
  const cleaned = content.trim().replace(/^```json\s*/i, '').replace(/\s*```$/, '');
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start >= 0 && end > start) return JSON.parse(cleaned.slice(start, end + 1));
    const error = new Error('The AI returned an invalid response.');
    error.statusCode = 502;
    error.code = 'AI_INVALID_RESPONSE';
    throw error;
  }
}

function validateResponse(data) {
  const hasText = (value) => typeof value === 'string' && value.trim().length > 0;
  const validQuiz = Array.isArray(data.quiz) && data.quiz.length === 3 && data.quiz.every(question =>
    hasText(question.question) &&
    Array.isArray(question.options) &&
    question.options.length === 4 &&
    question.options.every(hasText) &&
    Number.isInteger(question.correctAnswer) &&
    question.correctAnswer >= 0 &&
    question.correctAnswer < 4 &&
    hasText(question.explanation)
  );

  if (!hasText(data.topic) || !hasText(data.explanation) || !hasText(data.example) ||
      !Array.isArray(data.keyTakeaways) || data.keyTakeaways.length < 3 ||
      !data.keyTakeaways.every(hasText) || !validQuiz) {
    const error = new Error('The AI returned an incomplete response.');
    error.statusCode = 502;
    error.code = 'AI_INVALID_RESPONSE';
    throw error;
  }

  return {
    topic: data.topic.trim(),
    level: data.level,
    explanation: data.explanation.trim(),
    example: data.example.trim(),
    keyTakeaways: data.keyTakeaways.slice(0, 5).map(item => item.trim()),
    quiz: data.quiz
  };
}

async function generateSimplification(text, level) {
  if (!VALID_LEVELS.has(level)) throw new Error('Invalid explanation level.');

  const prompt = `Explain the following topic for the ${level} audience.
${LEVEL_GUIDANCE[level]}
Return only valid JSON with exactly these fields:
{
  "topic": "a concise title",
  "level": "${level}",
  "explanation": "the main explanation in markdown",
  "example": "a separate relevant real-world example",
  "keyTakeaways": ["three to five concise points"],
  "quiz": [
    {
      "question": "one question based only on the explanation",
      "options": ["option A", "option B", "option C", "option D"],
      "correctAnswer": 0,
      "explanation": "why the correct option is correct"
    }
  ]
}
Create exactly three quiz questions. Do not reveal answers in the question text. Keep quiz difficulty appropriate for the audience.

Topic:
${text}`;

  try {
    const response = await getClient().chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: 'You are a careful educational content generator. Output JSON only.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1600
    });
    const content = response.choices?.[0]?.message?.content;
    if (!content) {
      const error = new Error('The AI returned an empty response.');
      error.statusCode = 502;
      error.code = 'AI_INVALID_RESPONSE';
      throw error;
    }
    return validateResponse(parseResponse(content));
  } catch (error) {
    if (error.statusCode) throw error;
    if (error.status === 429 || error.code === 'rate_limit_exceeded') {
      const rateError = new Error('The AI service is temporarily rate-limited. Please try again shortly.');
      rateError.statusCode = 429;
      rateError.code = 'AI_RATE_LIMITED';
      throw rateError;
    }
    console.error('Groq request failed:', error.message);
    const serviceError = new Error('The AI service could not generate an explanation right now.');
    serviceError.statusCode = 502;
    serviceError.code = 'AI_REQUEST_FAILED';
    throw serviceError;
  }
}

module.exports = { generateSimplification };
