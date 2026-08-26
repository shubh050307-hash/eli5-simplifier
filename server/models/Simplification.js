const mongoose = require('mongoose');

const SimplificationSchema = new mongoose.Schema({
  originalText: {
    type: String,
    required: true
  },
  level: {
    type: String,
    enum: ['eli5', 'teen', 'expert'],
    default: 'eli5'
  },
  simplifiedText: {
    type: String,
    required: true
  },
  inputType: {
    type: String,
    enum: ['legal', 'medical', 'technical', 'general'],
    default: 'general'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Simplification', SimplificationSchema);