import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { MemoryStore } from './memoryStore';
import { STORY_BUILDER_SYSTEM_PROMPT, STORY_BUILDER_USER_PROMPT } from "./prompt/story_builder";

export interface StoryData {
  narration: string;
  imagePrompt: string;
  theme: string;
}

export class StoryBuilder {
  private llm: ChatOpenAI;
  private memoryStore: MemoryStore;

  constructor(memoryStore: MemoryStore, openAIApiKey: string) {
    this.llm = new ChatOpenAI({
      modelName: "gpt-4o",
      temperature: 0.7,
      openAIApiKey: openAIApiKey
    });
    this.memoryStore = memoryStore;
  }

  async extractAndBuild(userMessage: string): Promise<StoryData> {
    const context = this.memoryStore.getStoryContext();


    const messages = [
      new SystemMessage(STORY_BUILDER_SYSTEM_PROMPT),
      new HumanMessage(STORY_BUILDER_USER_PROMPT.replace("{context}", context).replace("{userMessage}", userMessage))
    ];

    const response = await this.llm.invoke(messages);
    const content = response.content as string;

    try {
      // Try to parse JSON response
      // Remove any markdown code block syntax if present
      const jsonString = content.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(jsonString);
      return {
        narration: parsed.narration || userMessage,
        imagePrompt: this.formatImagePrompt(parsed.imagePrompt || userMessage),
        theme: parsed.theme || ""
      };
    } catch (e) {
      console.error("Failed to parse JSON from StoryBuilder:", e);
      // Fallback
      return {
        narration: content, // Use full content if not JSON
        imagePrompt: this.formatImagePrompt(userMessage),
        theme: ""
      };
    }
  }

  private formatImagePrompt(prompt: string): string {
    return `Children's book illustration, colorful, friendly, comic panel style: ${prompt}`;
  }
}