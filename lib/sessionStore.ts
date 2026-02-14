import { ComicOrchestrator } from "@/agents/orchestrator";

// Singleton store for sessions
// In a production serverless environment, this should be replaced by a database (Redis, Postgres, etc.)
export const sessions = new Map<string, ComicOrchestrator>();
