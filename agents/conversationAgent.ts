import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { MemoryStore } from './memoryStore';
import OpenAI, { toFile } from "openai";
import { CONVERSATION_AGENT_SYSTEM_PROMPT, CONVERSATION_AGENT_USER_PROMPT } from "./prompt/conversationAgent";

export class ConversationAgent {
  private llm: ChatOpenAI;
  private memoryStore: MemoryStore;
  private openai: OpenAI;

  constructor(memoryStore: MemoryStore, openAIApiKey: string) {
    this.llm = new ChatOpenAI({
      modelName: "gpt-4o",
      temperature: 0.9,
      openAIApiKey: openAIApiKey
    });
    this.memoryStore = memoryStore;
    this.openai = new OpenAI({
      apiKey: openAIApiKey,
    });
  }

  async chat(userMessage: string): Promise<{ text: string; audioBase64: string }> {
    const iteration = this.memoryStore.getIterationCount();
    const context = this.memoryStore.getStoryContext();

    const messages = [
      new SystemMessage(CONVERSATION_AGENT_SYSTEM_PROMPT),
      new HumanMessage(CONVERSATION_AGENT_USER_PROMPT.replace("{context}", context).replace("{userMessage}", userMessage))
    ];

    const response = await this.llm.invoke(messages);
    const textResponse = response.content as string;

    try {
      const speech = await this.openai.audio.speech.create({
        model: 'gpt-4o-mini-tts',
        voice: 'nova',
        input: textResponse,
        response_format: 'mp3',
      });

      console.log("Audio generated via OpenAI TTS");
      const buffer = Buffer.from(await speech.arrayBuffer());

      return {
        text: textResponse,
        audioBase64: buffer.toString('base64')
      };
    } catch (error) {
      console.error("OpenAI TTS generation failed:", error);
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

}
