import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { ComicOrchestrator } from '@/agents/orchestrator';
import { sessions } from '@/lib/sessionStore';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { elevenLabsApiKey, openAIApiKey } = body;
        const sessionId = uuidv4();

        // Use environment variables as fallback if keys are not provided in request
        const finalElevenLabsKey = elevenLabsApiKey || process.env.ELEVENLABS_API_KEY || "";
        const finalOpenAIKey = openAIApiKey || process.env.OPENAI_API_KEY || "";

        const orchestrator = new ComicOrchestrator({
            sessionId,
            maxIterations: 5,
            elevenLabsApiKey: finalElevenLabsKey,
            openAIApiKey: finalOpenAIKey
        });
        sessions.set(sessionId, orchestrator);

        return NextResponse.json({
            sessionId,
            message: "Hi there! 👋 Let's create an amazing comic together! What's your story about?"
        });
    } catch (error: any) {
        console.error("Error creating session:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
