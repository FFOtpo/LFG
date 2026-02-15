import express, { Request, Response } from 'express';
import cors from 'cors';
import { ComicOrchestrator } from './orchestrator';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = process.env.PORT || 3000;

// Store orchestrators by session
const sessions = new Map<string, ComicOrchestrator>();

app.use(cors());
app.use(express.json());

// Create new session
app.post('/api/session/new', (req: Request, res: Response) => {
  const { elevenLabsApiKey, openAIApiKey } = req.body;
  const sessionId = uuidv4();

  // Use environment variables as fallback if keys are not provided in request
  const finalElevenLabsKey = elevenLabsApiKey || process.env.ELEVENLABS_API_KEY || "";
  const finalOpenAIKey = openAIApiKey || process.env.OPENAI_API_KEY || "";

  const orchestrator = new ComicOrchestrator({
    sessionId,
    maxIterations: 5,
    openAIApiKey: finalOpenAIKey,
    googleApiKey: process.env.GOOGLE_API_KEY || ""
  });
  sessions.set(sessionId, orchestrator);

  res.json({
    sessionId,
    message: "Hi there! 👋 Let's create an amazing comic together! What's your story about?"
  });
});

// Chat endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { sessionId, message, audioBase64 } = req.body;

    console.log("Received chat request:", { sessionId, hasMessage: !!message, hasAudio: !!audioBase64, audioLength: audioBase64?.length });

    if (!sessionId || (!message && !audioBase64)) {
      console.log("Validation failed: sessionId or content missing");
      return res.status(400).json({ error: "sessionId and either message or audioBase64 are required" });
    }

    let orchestrator = sessions.get(sessionId);
    if (!orchestrator) {
      return res.status(404).json({ error: "Session not found. Create a new session." });
    }

    const result = await orchestrator.handleUserMessage(audioBase64);

    res.json(result);
  } catch (error: any) {
    console.error("Chat error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// Reset session
app.post('/api/session/reset', (req: Request, res: Response) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: "sessionId is required" });
  }

  const orchestrator = sessions.get(sessionId);
  if (orchestrator) {
    orchestrator.reset();
    res.json({ message: "Session reset successfully" });
  } else {
    res.status(404).json({ error: "Session not found" });
  }
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`🚀 Comic Creator API running on port ${PORT}`);
});

export default app;