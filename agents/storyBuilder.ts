import { ChatAnthropic } from "@langchain/anthropic";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { MemoryStore } from './memoryStore';

export interface StoryData {
  narration: string;
  imagePrompt: string;
}

export class StoryBuilder {
  private llm: ChatAnthropic;
  private memoryStore: MemoryStore;

  constructor(memoryStore: MemoryStore) {
    this.llm = new ChatAnthropic({
      modelName: "claude-sonnet-4-20250514",
      temperature: 0.7,
    });
    this.memoryStore = memoryStore;
  }

  async extractAndBuild(userMessage: string): Promise<StoryData> {
    const context = this.memoryStore.getStoryContext();

    const systemPrompt = "Extract story details and create a narration and image prompt. Return JSON: {narration: string, imagePrompt: string}";

    const messages = [
      new SystemMessage(systemPrompt),
      new HumanMessage(`Context: ${context}\n\nNew input: ${userMessage}\n\nGenerate narration and kid-friendly comic image prompt.`)
    ];

    const response = await this.llm.invoke(messages);
    const content = response.content as string;

    try {
      // Try to parse JSON response
      const parsed = JSON.parse(content);
      return {
        narration: parsed.narration || userMessage,
        imagePrompt: this.formatImagePrompt(parsed.imagePrompt || userMessage)
      };
    } catch {
      // Fallback if not JSON
      return {
        narration: userMessage,
        imagePrompt: this.formatImagePrompt(userMessage)
      };
    }
  }

  private formatImagePrompt(prompt: string): string {
    return `Children's book illustration, colorful, friendly, comic panel style: ${prompt}`;
  }
}