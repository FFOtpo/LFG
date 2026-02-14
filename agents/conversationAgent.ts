import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { MemoryStore } from './memoryStore';
import { ElevenLabsClient } from "elevenlabs";
import OpenAI, { toFile } from "openai";

export class ConversationAgent {
  private llm: ChatOpenAI;
  private memoryStore: MemoryStore;
  private elevenLabs: ElevenLabsClient;
  private openai: OpenAI;

  constructor(memoryStore: MemoryStore, elevenLabsApiKey: string, openAIApiKey: string) {
    this.llm = new ChatOpenAI({
      modelName: "gpt-4o",
      temperature: 0.9,
      openAIApiKey: openAIApiKey
    });
    this.memoryStore = memoryStore;
    this.elevenLabs = new ElevenLabsClient({
      apiKey: elevenLabsApiKey,
    });
    this.openai = new OpenAI({
      apiKey: openAIApiKey,
    });
  }

  async chat(userMessage: string): Promise<{ text: string; audioBase64: string }> {
    const iteration = this.memoryStore.getIterationCount();
    const context = this.memoryStore.getStoryContext();

    const messages = [
      new SystemMessage(this.getSystemPrompt(iteration)),
      new HumanMessage(`Context: ${context}\n\nKid says: ${userMessage}`)
    ];

    const response = await this.llm.invoke(messages);
    const textResponse = response.content as string;

    try {
      const audioStream = await this.elevenLabs.generate({
        voice: "ztqW7U07ITK9TRp5iDUi",
        text: textResponse,
        model_id: "eleven_flash_v2_5",
      });

      const chunks: Uint8Array[] = [];
      for await (const chunk of audioStream) {
        chunks.push(chunk);
      }
      const audioBuffer = Buffer.concat(chunks);

      return {
        text: textResponse,
        audioBase64: audioBuffer.toString('base64')
      };
    } catch (error) {
      console.error("ElevenLabs generation failed:", error);
      return {
        text: textResponse,
        audioBase64: ""
      };
    }
  }

  async transcribeAudio(audioBuffer: Buffer): Promise<string> {
    try {
      const file = await toFile(audioBuffer, "audio.wav");
      const response = await this.openai.audio.transcriptions.create({
        file: file,
        model: "whisper-1",
      });
      return response.text;
    } catch (error) {
      console.error("OpenAI Whisper STT failed:", error);
      throw error;
    }
  }

  private getSystemPrompt(iteration: number): string {
    return iteration === 0
      ? "Ask the kid about their story idea in a fun, encouraging way. Keep it brief."
      : "Based on the previous panel, ask what happens next. Be encouraging and creative. Keep it brief.";
  }
}
