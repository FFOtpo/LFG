# KidComic AI Agent 🎨📖

AI-powered comic creator that chats with kids to create amazing illustrated stories!

## Features

- 🤖 **Conversational Agent**: Engages kids with creative questions
- 🎨 **Auto Image Generation**: DALL-E 3 creates comic panels
- 📚 **PDF Comic Book**: Beautiful final output
- 💾 **Session Management**: Multiple kids can use it simultaneously
- 🛡️ **Unbreakable**: Error handling for demos

## Architecture

```
Orchestrator
    ├── ConversationAgent (Claude)
    ├── StoryBuilder (Claude)
    ├── ImageGenerator (DALL-E)
    ├── ComicAssembler (PDF)
    └── MemoryStore (Session State)
```

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment

Copy `.env.example` to `.env` and add your API keys:

```bash
cp .env.example .env
```

Edit `.env`:
```
ANTHROPIC_API_KEY=sk-ant-xxxxx
OPENAI_API_KEY=sk-xxxxx
PORT=3000
```

### 3. Run Development Server

```bash
npm run dev
```

Server runs on `http://localhost:3000`

## API Endpoints

### Create New Session
```bash
POST /api/session/new
Response: { sessionId: "uuid", message: "greeting" }
```

### Chat
```bash
POST /api/chat
Body: { sessionId: "uuid", message: "kid's input" }
Response: { 
  response: "agent reply",
  imageUrl: "url",
  isDone: false 
}
```

### Reset Session
```bash
POST /api/session/reset
Body: { sessionId: "uuid" }
```

## Demo Flow

1. **Start**: Create session → Get greeting
2. **Loop** (5 iterations):
   - Kid tells story
   - Agent asks creative questions
   - Generate panel image
   - Show image, ask "what's next?"
3. **Finish**: Generate PDF comic book

## Testing (Postman/curl)

```bash
# 1. Create session
curl -X POST http://localhost:3000/api/session/new

# 2. Send message
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "YOUR_SESSION_ID",
    "message": "I want to tell a story about a space adventure"
  }'
```

## Customization

### Adjust Iterations
In `orchestrator.ts`:
```typescript
this.maxIterations = config.maxIterations || 5; // Change this
```

### Update Prompts
In `agents/conversationAgent.ts`:
```typescript
return "Your custom prompt here";
```

### Change Image Style
In `agents/storyBuilder.ts`:
```typescript
return `Your custom style: ${prompt}`;
```

## File Structure

```
src/
├── orchestrator.ts          # Main controller
├── server.ts                # Express API
├── agents/
│   ├── conversationAgent.ts # Chat with kids
│   ├── storyBuilder.ts      # Extract story elements
│   ├── imageGenerator.ts    # DALL-E integration
│   └── comicAssembler.ts    # PDF generation
└── store/
    └── memoryStore.ts       # Session state
```

## Production Build

```bash
npm run build
npm start
```

## Troubleshooting

**Image generation fails?**
- Check OPENAI_API_KEY is valid
- Images fallback to placeholder automatically

**Claude API errors?**
- Verify ANTHROPIC_API_KEY
- Check rate limits

**PDF not generating?**
- Ensure `output/` directory exists
- Check image URLs are accessible

## License

MIT

## Hackathon Tips

✅ Test with: "space adventure", "dragon kingdom", "underwater city"  
✅ Kids love: animals, superheroes, magic  
✅ Demo flow: 30 seconds per iteration = 2.5min total  
✅ Show the PDF at the end for WOW factor!


# Project Structure

```
kidcomic-ai-agent/
│
├── src/
│   ├── orchestrator.ts              # 🎯 Main controller - coordinates all agents
│   ├── server.ts                    # 🚀 Express API server
│   │
│   ├── agents/
│   │   ├── conversationAgent.ts     # 💬 Chats with kids using Claude
│   │   ├── storyBuilder.ts          # 📝 Extracts story + creates prompts
│   │   ├── imageGenerator.ts        # 🎨 DALL-E integration
│   │   └── comicAssembler.ts        # 📄 PDF comic generator
│   │
│   └── store/
│       └── memoryStore.ts           # 💾 Session state management
│
├── output/                          # 📁 Generated PDFs saved here
│
├── package.json                     # 📦 Dependencies
├── tsconfig.json                    # ⚙️  TypeScript config
├── .env.example                     # 🔑 Environment variables template
├── .gitignore                       # 🚫 Git ignore rules
├── README.md                        # 📖 Documentation
└── test-example.ts                  # 🧪 Test script
```

## Key Files Explained

### orchestrator.ts
- Entry point for the AI agent flow
- Manages the iteration loop (5 rounds by default)
- Coordinates all sub-agents
- Returns results to API

### agents/conversationAgent.ts
- Uses Claude to chat with kids
- Asks creative questions
- Encourages imagination
- 1-line prompts (easy to customize)

### agents/storyBuilder.ts
- Extracts key story elements
- Creates narration text
- Generates image prompts
- Returns structured data

### agents/imageGenerator.ts
- Calls DALL-E 3 API
- Kid-friendly illustration style
- Fallback to placeholder on error

### agents/comicAssembler.ts
- Takes all panels
- Creates PDF with images + text
- Beautiful layout
- Downloadable output

### store/memoryStore.ts
- Stores session state
- Tracks iteration count
- Builds story context
- Simple in-memory (no DB needed)

### server.ts
- REST API endpoints
- Session management
- CORS enabled
- Error handling

## API Flow

1. POST `/api/session/new` → Get sessionId
2. POST `/api/chat` → Send message, get response + image
3. Repeat step 2 (5 times)
4. Final response includes PDF path
5. POST `/api/session/reset` → Start over