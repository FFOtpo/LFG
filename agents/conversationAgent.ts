import { ChatAnthropic } from "@langchain/anthropic";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { MemoryStore } from './memoryStore';
import { ElevenLabsClient } from "elevenlabs"; // Import ElevenLabs

export class ConversationAgent {
  private llm: ChatAnthropic;
  private memoryStore: MemoryStore;
  private elevenLabs: ElevenLabsClient;

  constructor(memoryStore: MemoryStore, apiKey: string) {
    this.llm = new ChatAnthropic({
      modelName: "claude-sonnet-4-20250514",
      temperature: 0.9,
    });
    this.memoryStore = memoryStore;

    // Initialize ElevenLabs
    this.elevenLabs = new ElevenLabsClient({
      apiKey: apiKey,
    });
  }

  async chat(userMessage: string): Promise<{ text: string; audioBuffer: Buffer }> {
    const iteration = this.memoryStore.getIterationCount();
    const context = this.memoryStore.getStoryContext();

    const messages = [
      new SystemMessage(this.getSystemPrompt(iteration)),
      new HumanMessage(`Context: ${context}\n\nKid says: ${userMessage}`)
    ];

    const response = await this.llm.invoke(messages);
    const textResponse = response.content as string;

    // Generate speech from the LLM response
    const audioStream = await this.elevenLabs.generate({
      voice: "George", // You can pick a fun "storyteller" voice ID here
      text: textResponse,
      model_id: "eleven_multilingual_v2",
    });

    // Convert stream to Buffer for easy handling
    const chunks: Uint8Array[] = [];
    for await (const chunk of audioStream) {
      chunks.push(chunk);
    }
    const audioBuffer = Buffer.concat(chunks);

    return {
      text: textResponse,
      audioBuffer: audioBuffer
    };
  }

  private getSystemPrompt(iteration: number): string {
    return iteration === 0
      ? "Ask the kid about their story idea in a fun, encouraging way. Keep it brief."
      : "Based on the story context, ask what happens next. Be creative!";
  }
}