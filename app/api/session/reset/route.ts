import { NextResponse } from 'next/server';
import { sessions } from '@/lib/sessionStore';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { sessionId } = body;

        if (!sessionId) {
            return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
        }

        const orchestrator = sessions.get(sessionId);
        if (orchestrator) {
            orchestrator.reset();
            return NextResponse.json({ message: "Session reset successfully" });
        } else {
            return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }
    } catch (error: any) {
        console.error("Reset session error:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
