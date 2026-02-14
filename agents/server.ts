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
  const sessionId = uuidv4();
  const orchestrator = new ComicOrchestrator({ sessionId, maxIterations: 5 });
  sessions.set(sessionId, orchestrator);
  
  res.json({ 
    sessionId,
    message: "Hi there! 👋 Let's create an amazing comic together! What's your story about?"
  });
});

// Chat endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { sessionId, message } = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({ error: "sessionId and message are required" });
    }

    let orchestrator = sessions.get(sessionId);
    if (!orchestrator) {
      return res.status(404).json({ error: "Session not found. Create a new session." });
    }

    const result = await orchestrator.handleUserMessage(message);
    
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