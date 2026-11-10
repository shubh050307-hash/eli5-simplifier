# ELI5 Simplifier

ELI5 Simplifier is a lightweight AI learning companion. Enter a complex topic, choose how deeply you want it explained, and receive:

- A level-appropriate explanation
- A relevant real-world example
- Three to five key takeaways
- A three-question knowledge-check quiz

The app keeps recent queries in the browser, so it does not require user accounts or cloud-synchronized history.

## Features

- **Three explanation levels:** ELI5, Teen, and Expert.
- **Structured educational output:** explanation, example, takeaways, and quiz.
- **Interactive quiz:** answer selection, immediate feedback, explanations, score, and retry.
- **Contextual follow-ups:** ask another question about the current explanation without losing the selected learning level.
- **Local history:** the latest 20 successful queries are stored in `localStorage`.
- **Copy, read aloud, and Markdown export** for generated content.
- **Clear loading and error states** with retry actions.
- **Safe Markdown rendering:** AI text is rendered with `react-markdown` and raw HTML is disabled.
- **Responsive dark UI:** preserves the original glassmorphism and ambient visual style.
- **Server-side AI integration:** the Groq API key never enters the frontend bundle.

## Stack

### Frontend

- React
- Vite
- Tailwind CSS
- Framer Motion
- React Markdown
- Lucide React

### Backend

- Node.js
- Express
- Groq SDK
- CORS
- dotenv

MongoDB and Mongoose are intentionally not used. Browser local storage is sufficient for this project's recent-query history.

## Project Structure

```text
eli5-simplifier/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── HeroSection.jsx
│   │   │   ├── ResultsSection.jsx
│   │   │   └── HistoryDrawer.jsx
│   │   ├── lib/
│   │   │   └── utils.js
│   │   └── App.jsx
│   └── package.json
├── server/
│   ├── controllers/
│   │   └── simplifyController.js
│   ├── middleware/
│   │   └── errorHandler.js
│   ├── routes/
│   │   └── simplifyRoutes.js
│   ├── services/
│   │   └── groqService.js
│   ├── .env
│   └── server.js
└── README.md
```

## Requirements

- Node.js 18+
- npm
- A Groq API key

## Setup

Install backend dependencies:

```bash
cd "/Users/shuubhgupta/ELI5 Simplifier/eli5-simplifier/server"
npm install
```

Install frontend dependencies:

```bash
cd "/Users/shuubhgupta/ELI5 Simplifier/eli5-simplifier/client"
npm install
```

Create `server/.env`:

```env
GROQ_API_KEY=your_groq_api_key
PORT=5000
```

For production, configure the deployed frontend origin:

```env
CLIENT_URL=https://your-frontend.example.com
```

`PORT` defaults to `5000` locally and uses the hosting platform's assigned port when provided. `CLIENT_URL` may contain multiple comma-separated origins. In production, browser origins not listed in `CLIENT_URL` are rejected; if `CLIENT_URL` is missing, the server logs a warning and rejects browser origins.

Never commit `.env` or expose the Groq key through a `VITE_*` variable.

## Run Locally

Start the backend:

```bash
cd "/Users/shuubhgupta/ELI5 Simplifier/eli5-simplifier/server"
node server.js
```

The backend runs at `http://localhost:5000`.

In a second terminal, start the frontend:

```bash
cd "/Users/shuubhgupta/ELI5 Simplifier/eli5-simplifier/client"
npm run dev
```

Open the Vite URL shown in the terminal, usually `http://localhost:5173`.

For local development, Vite proxies `/api` requests to the backend. For an independently deployed frontend, set the frontend variable before building:

```env
VITE_API_URL=https://your-backend.example.com
```

When `VITE_API_URL` is unset, the frontend uses the current origin and the Vite development proxy handles local API requests.

## API

### Health check

```http
GET /
```

```json
{ "status": "ok" }
```

### Generate an explanation

```http
POST /api/simplify
Content-Type: application/json
```

Request:

```json
{
  "text": "Explain artificial intelligence",
  "level": "teen"
}
```

Follow-up requests use the same endpoint and include the current explanation as context:

```json
{
  "text": "Can you give me another example?",
  "level": "eli5",
  "context": {
    "topic": "Artificial Intelligence",
    "explanation": "The current generated explanation..."
  }
}
```

The backend validates follow-up context before sending it to Groq and returns the same structured response shape.

Supported levels are `eli5`, `teen`, and `expert`. Input is limited to 5,000 characters.

Successful response:

```json
{
  "success": true,
  "data": {
    "topic": "Artificial Intelligence",
    "level": "teen",
    "explanation": "Explanation in Markdown...",
    "example": "A relevant real-world example...",
    "keyTakeaways": [
      "First important point",
      "Second important point",
      "Third important point"
    ],
    "quiz": [
      {
        "question": "What does AI learn from?",
        "options": ["Data", "Gravity", "Weather", "Passwords"],
        "correctAnswer": 0,
        "explanation": "AI systems learn patterns from data."
      }
    ]
  }
}
```

The API always creates one explanation for the selected level; it does not generate unused levels.

Example:

```bash
curl -X POST http://localhost:5000/api/simplify \
  -H "Content-Type: application/json" \
  -d '{"text":"Explain artificial intelligence","level":"teen"}'
```

The endpoint validates empty input, input length, explanation level, AI configuration, rate limits, and the structure of the AI response. Errors return a safe JSON message without stack traces or credentials.

## Frontend Commands

```bash
npm run dev       # Start the Vite development server
npm run build     # Build the production bundle
npm run preview   # Preview the production bundle
npm run lint      # Run ESLint
```

## Backend Commands

```bash
npm start         # Start the backend
npm test          # Run the built-in Node.js test suite
```

The backend applies a lightweight per-IP limit of 20 simplify requests per minute. Tests mock the Groq service and do not require production credentials.

## Known Limitations

- The AI response depends on Groq availability, quota, and model access.
- Recent history is device- and browser-specific because it uses `localStorage`.
- Read-aloud depends on browser Speech Synthesis support.
- No authentication, cloud history, or user profiles are included by design.

## License

This project is intended for educational and demonstration purposes.
