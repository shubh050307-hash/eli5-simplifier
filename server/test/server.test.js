const assert = require('node:assert/strict');
const { after, before, test } = require('node:test');
const app = require('../server');
const groqService = require('../services/groqService');

const validData = {
  topic: 'APIs',
  explanation: 'An API lets programs communicate.',
  example: 'A weather app uses an API to request forecasts.',
  keyTakeaways: ['Programs communicate', 'Requests get responses', 'APIs hide implementation details'],
  quiz: [
    { question: 'What does an API enable?', options: ['Communication', 'Cooking', 'Drawing', 'Sleeping'], correctAnswer: 0, explanation: 'APIs let programs communicate.' },
    { question: 'How many options are provided?', options: ['One', 'Two', 'Four', 'Five'], correctAnswer: 2, explanation: 'Each question has four options.' },
    { question: 'What is the example about?', options: ['Weather', 'Music', 'Sports', 'Travel'], correctAnswer: 0, explanation: 'A weather app uses an API.' }
  ]
};

let server;
let originalGenerate;
let baseUrl;

before(async () => {
  originalGenerate = groqService.generateSimplification;
  server = app.listen(0);
  await new Promise(resolve => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  groqService.generateSimplification = originalGenerate;
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
});

async function request(body, headers = {}) {
  return fetch(`${baseUrl}/api/simplify`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body)
  });
}

test('validates empty and whitespace-only input', async () => {
  for (const text of ['', '   ']) {
    const response = await request({ text, level: 'eli5' });
    assert.equal(response.status, 400);
  }
});

test('rejects oversized input', async () => {
  const response = await request({ text: 'x'.repeat(5001), level: 'eli5' });
  assert.equal(response.status, 413);
});

test('accepts a missing level with the ELI5 default and rejects invalid levels', async () => {
  groqService.generateSimplification = async (text, level) => ({ ...validData, topic: text, level });
  const defaultResponse = await request({ text: 'A valid topic' });
  assert.equal(defaultResponse.status, 200);
  assert.equal((await defaultResponse.json()).data.level, 'eli5');

  const invalidResponse = await request({ text: 'A valid topic', level: 'all' });
  assert.equal(invalidResponse.status, 400);
});

test('returns the selected level and structured data on success', async () => {
  groqService.generateSimplification = async (text, level) => ({ ...validData, topic: text, level });
  const response = await request({ text: 'Explain APIs', level: 'teen' });
  const payload = await response.json();
  assert.equal(response.status, 200);
  assert.equal(payload.success, true);
  assert.equal(payload.data.level, 'teen');
  assert.equal(payload.data.quiz.length, 3);
});

test('passes follow-up context to the AI service', async () => {
  let receivedContext;
  groqService.generateSimplification = async (text, level, context) => {
    receivedContext = { text, level, context };
    return { ...validData, topic: 'APIs follow-up', level };
  };
  const response = await request({
    text: 'Can you give me another example?',
    level: 'eli5',
    context: { topic: 'APIs', explanation: validData.explanation }
  });
  assert.equal(response.status, 200);
  assert.equal(receivedContext.context.topic, 'APIs');
  assert.equal(receivedContext.text, 'Can you give me another example?');
});

test('rejects invalid follow-up context', async () => {
  const response = await request({ text: 'Why?', level: 'eli5', context: { topic: 'APIs' } });
  assert.equal(response.status, 400);
});

test('maps Groq failures to a safe API error', async () => {
  groqService.generateSimplification = async () => {
    const error = new Error('provider details');
    error.statusCode = 502;
    error.code = 'AI_REQUEST_FAILED';
    throw error;
  };
  const response = await request({ text: 'Explain APIs', level: 'expert' });
  const payload = await response.json();
  assert.equal(response.status, 502);
  assert.equal(payload.success, false);
  assert.equal(payload.error, 'provider details');
});

test('rate limits repeated simplify requests', async () => {
  groqService.generateSimplification = async () => ({ ...validData, level: 'eli5' });
  const responses = await Promise.all(
    Array.from({ length: 21 }, () => request({ text: 'rate limit check', level: 'eli5' }))
  );
  assert.ok(responses.some(response => response.status === 429));
});

test('validates AI response fields and quiz shape', () => {
  const { validateResponse, parseResponse } = groqService;
  assert.doesNotThrow(() => validateResponse(validData));
  assert.equal(validateResponse({ ...validData, level: 'expert' }).level, undefined);
  for (const invalid of [
    { ...validData, explanation: '' },
    { ...validData, example: '' },
    { ...validData, keyTakeaways: ['one', 'two'] },
    { ...validData, keyTakeaways: ['one', 'two', 'three', 'four', 'five', 'six'] },
    { ...validData, quiz: [] },
    { ...validData, quiz: [{ ...validData.quiz[0], options: ['one'] }, ...validData.quiz.slice(1)] },
    { ...validData, quiz: [{ ...validData.quiz[0], correctAnswer: 4 }, ...validData.quiz.slice(1)] }
  ]) {
    assert.throws(() => validateResponse(invalid), /incomplete response/);
  }
  assert.throws(() => parseResponse('{not valid json}'), /invalid response/);
});

test('handles a missing API key without exposing secrets', async () => {
  groqService.generateSimplification = originalGenerate;
  const currentKey = process.env.GROQ_API_KEY;
  delete process.env.GROQ_API_KEY;
  try {
    const response = await groqService.generateSimplification('Explain APIs', 'eli5').catch(error => error);
    assert.equal(response.statusCode, 503);
    assert.doesNotMatch(response.message, /gsk_|api key/i);
  } finally {
    process.env.GROQ_API_KEY = currentKey;
  }
});
