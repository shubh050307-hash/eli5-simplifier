const groqService = require('../services/groqService');

const VALID_LEVELS = ['eli5', 'teen', 'expert'];
const MAX_LENGTH = 5000;

exports.simplifyText = async (req, res, next) => {
  const { text, level = 'eli5' } = req.body || {};

  if (typeof text !== 'string' || text.trim().length === 0) {
    return res.status(400).json({ success: false, error: 'Enter a topic or question to explain.' });
  }

  if (text.length > MAX_LENGTH) {
    return res.status(413).json({
      success: false,
      error: `Your input is too long. Please keep it under ${MAX_LENGTH} characters.`
    });
  }

  if (!VALID_LEVELS.includes(level)) {
    return res.status(400).json({
      success: false,
      error: 'Choose a valid explanation level: eli5, teen, or expert.'
    });
  }

  try {
    const data = await groqService.generateSimplification(text.trim(), level);
    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};