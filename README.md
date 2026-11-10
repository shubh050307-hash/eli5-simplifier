# ELI5 Simplifier

ELI5 Simplifier is an AI-powered web application that turns complex questions and topics into clear explanations for three audiences:

- **5-year-old:** simple words, short sentences, and relatable analogies
- **Teenager:** plain language, practical examples, and context
- **Adult / expert:** precise technical details and structured reasoning

The application uses a React frontend, an Express backend, Groq for AI-generated explanations, and MongoDB for storing generated simplifications.

## Features

- Generate three explanation levels from one question.
- View explanations in a responsive, card-based interface.
- Copy explanations to the clipboard.
- Read explanations aloud with the browser Speech Synthesis API.
- Export explanations as Markdown files.
- Keep the latest 20 queries in browser local storage.
- Reopen previous queries from the history drawer.
- Clear saved local history.
- Display demo responses when the backend request fails or times out.
- Persist successful explanations to MongoDB.

## Technology Stack

### Frontend

- React 19
- Vite
- Tailwind CSS
- Framer Motion
- Lucide React

### Backend

- Node.js
- Express 5
- Groq SDK
- Mongoose
- MongoDB
- CORS
- dotenv

## Project Structure

```text
eli5-simplifier/
├── client/
│   ├── src/
│   │   ├── components/       # UI components
│   │   ├── lib/              # Demo data and browser utilities
│   │   └── App.jsx           # Main application flow
│   └── package.json
├── server/
│   ├── controllers/          # AI generation logic
│   ├── models/               # MongoDB schemas
│   ├── routes/               # Express API routes
│   ├── .env                 # Local secrets; do not commit
│   └── package.json
└── README.md
```

## Requirements

- Node.js 18 or newer
- npm
- A Groq API key
- A MongoDB connection string

## Installation

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

## Environment Configuration

Create or update `server/.env`:

```env
GROQ_API_KEY=your_groq_api_key
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/eli5
```

Do not commit real API keys, passwords, or connection strings. If a MongoDB username or password contains special characters, URL-encode them before placing them in the URI.

## Running the Application

Start the backend in one terminal:

```bash
cd "/Users/shuubhgupta/ELI5 Simplifier/eli5-simplifier/server"
node server.js
```

The backend runs at `http://localhost:5000`.

Start the frontend in a second terminal:

```bash
cd "/Users/shuubhgupta/ELI5 Simplifier/eli5-simplifier/client"
npm run dev
```

Open the Vite URL shown in the terminal, usually `http://localhost:5173`.

The frontend sends requests to:

```text
http://localhost:5000/api/simplify/all
```

## API

### Health check

```http
GET /
```

Successful response:

```json
{
  "status": "ok"
}
```

### Generate all explanations

```http
POST /api/simplify/all
Content-Type: application/json
```

Request body:

```json
{
  "text": "Explain how gravity works",
  "inputType": "general"
}
```

Response:

```json
{
  "eli5": "An explanation for a curious 5-year-old.",
  "teen": "An explanation for a teenager.",
  "expert": "A technical explanation for an expert reader."
}
```

The `text` field is required and is limited to 5,000 characters. Supported `inputType` values are `general`, `legal`, `medical`, and `technical`.

Example request with cURL:

```bash
curl -X POST http://localhost:5000/api/simplify/all \
  -H "Content-Type: application/json" \
  -d '{"text":"Explain how gravity works","inputType":"general"}'
```

### Generate one explanation

```http
POST /api/simplify
Content-Type: application/json
```

Request body:

```json
{
  "text": "Explain how gravity works",
  "level": "eli5",
  "inputType": "general"
}
```

Supported `level` values are `eli5`, `teen`, and `expert`.

## Data Storage

The browser stores recent query results under the `eli5_history` local storage key and keeps up to 20 entries.

When MongoDB is configured, each generated explanation is stored as a `Simplification` document with:

- Original text
- Explanation level
- Simplified text
- Input type
- Creation timestamp

## Troubleshooting

### The frontend says "Something went wrong"

1. Confirm the backend is running on port `5000`.
2. Check the backend terminal for Groq or MongoDB errors.
3. Confirm `GROQ_API_KEY` is present in `server/.env`.
4. Confirm the configured Groq model is available to your API key.
5. Confirm the frontend is calling `http://localhost:5000`.

If the backend is unavailable, the frontend displays a local demo response instead of leaving the results area empty.

### MongoDB connection errors

Check that:

- `MONGODB_URI` exists in `server/.env`.
- The MongoDB cluster is running.
- Your IP address is allowed in MongoDB network access settings.
- The database username and password are correct.
- Special characters in credentials are URL-encoded.

MongoDB is used for persistence; AI generation still depends on the Groq API.

## Development Commands

### Frontend

```bash
npm run dev       # Start the Vite development server
npm run build     # Create a production build
npm run preview   # Preview the production build
npm run lint      # Run ESLint
```

### Backend

```bash
node server.js    # Start the Express server
```

## License

This project is intended for educational and demonstration purposes.
