const Groq = require('groq-sdk');
const Simplification = require('../models/Simplification');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const LEVEL_PROMPTS = {
  eli5: "Explain this as if to a curious 5-year-old. Use simple words, short sentences, and a relatable analogy.",
  teen: "Explain this in plain language a smart teenager could follow. Avoid jargon; define any technical term you must use.",
  expert: "Give a precise, technical summary assuming the reader has domain background."
};

exports.simplifyText = async (req, res) => {
  try {
    const { text, level = 'eli5', inputType = 'general' } = req.body;

    // basic validation (full version comes in step 8, this is a minimal guard for now)
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const MAX_LENGTH = 5000;
    if (text.length > MAX_LENGTH) {
      return res.status(400).json({ 
        error: `Text too long. Max ${MAX_LENGTH} characters, you sent ${text.length}.` 
      });
    }

    // Validate level is one of the allowed values
    const validLevels = ['eli5', 'teen', 'expert'];
    if (!validLevels.includes(level)) {
      return res.status(400).json({ error: `Invalid level. Must be one of: ${validLevels.join(', ')}` });
    }

    const systemPrompt = `You are a simplification assistant. ${LEVEL_PROMPTS[level]}
    The input is a ${inputType} document. Keep your explanation under 200 words.`;

    const response = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text }
      ],
      max_tokens: 300
    });

    const simplifiedText = response.choices[0].message.content;

    const saved = await Simplification.create({
      originalText: text,
      level,
      simplifiedText,
      inputType
    });

    res.json({ simplifiedText, id: saved._id });

  } catch (err) {
    console.error('Simplify error:', err.message);
    res.status(500).json({ error: 'Something went wrong while simplifying the text' });
  }
};