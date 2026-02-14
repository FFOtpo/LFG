import { NextResponse } from 'next/server';
import { sessions } from '@/lib/sessionStore';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { sessionId, message } = body;

        if (!sessionId || !message) {
            return NextResponse.json({ error: "sessionId and message are required" }, { status: 400 });
        }

        const orchestrator = sessions.get(sessionId);
        if (!orchestrator) {
            return NextResponse.json({ error: "Session not found. Create a new session." }, { status: 404 });
        }

        const result = await orchestrator.handleUserMessage(message);

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("Chat error:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
