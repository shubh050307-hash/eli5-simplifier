const Groq = require('groq-sdk');
const Simplification = require('../models/Simplification');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const LEVEL_PROMPTS = {
  eli5: `You are a world-class educator speaking to a curious 5-year-old. 
Explain the concept using:
- Extremely simple words (no jargon whatsoever)
- 1-2 vivid, relatable analogies (toys, food, animals, family, etc.)
- Short, punchy sentences (max 12 words each)
- A warm, wonder-filled tone
- End with a "Core Idea:" summary in one sentence

Keep it under 180 words total.`,

  teen: `You are a brilliant mentor explaining to a sharp, curious teenager (age 15-17).
Explain using:
- Plain English with minimal jargon (define any term you must use)
- Real-world examples they'd actually encounter (sports, tech, social media, school)
- The "why it matters" angle — connect it to their world
- Conversational but intellectually engaging tone
- End with a "Key Takeaway:" in one crisp sentence

Keep it under 220 words total.`,

  expert: `You are a senior domain expert giving a precise technical briefing to a peer professional.
Explain using:
- Accurate technical terminology without over-explaining basics
- First-principles reasoning and underlying mechanisms
- Quantitative details, edge cases, or systems-level implications where relevant
- Structured breakdown: core concept → mechanism → real-world implications
- End with a "Executive Summary:" in 1-2 technical sentences

Keep it under 280 words total.`
};

/**
 * POST /api/simplify/all
 * Body: { text: string, inputType?: string }
 * Returns: { eli5: string, teen: string, expert: string }
 */
exports.simplifyAll = async (req, res) => {
  try {
    const { text, inputType = 'general' } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const MAX_LENGTH = 5000;
    if (text.length > MAX_LENGTH) {
      return res.status(400).json({
        error: `Text too long. Max ${MAX_LENGTH} characters, you sent ${text.length}.`
      });
    }

    // Fire all 3 Groq calls in parallel
    const levels = ['eli5', 'teen', 'expert'];

    const promises = levels.map(level => {
      const systemPrompt = `${LEVEL_PROMPTS[level]}\nThe input is a ${inputType} topic/question.`;
      return groq.chat.completions.create({
        model: 'openai/gpt-oss-120b',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text }
        ],
        max_tokens: 400
      });
    });

    const results = await Promise.all(promises);

    const explanations = {
      eli5: results[0].choices[0].message.content,
      teen: results[1].choices[0].message.content,
      expert: results[2].choices[0].message.content
    };

    // Persist to MongoDB (non-blocking — fire and forget)
    Promise.all(
      levels.map((level, i) =>
        Simplification.create({
          originalText: text,
          level,
          simplifiedText: explanations[level],
          inputType
        }).catch(err => console.error(`DB save failed for ${level}:`, err.message))
      )
    );

    res.json(explanations);
  } catch (err) {
    console.error('SimplifyAll error:', err.message);
    res.status(500).json({ error: 'Something went wrong while generating explanations. Please check your API key and try again.' });
  }
};
