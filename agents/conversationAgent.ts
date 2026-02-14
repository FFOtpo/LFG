import { ChatAnthropic } from "@langchain/anthropic";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { MemoryStore } from './memoryStore';

export class ConversationAgent {
  private llm: ChatAnthropic;
  private memoryStore: MemoryStore;

  constructor(memoryStore: MemoryStore) {
    this.llm = new ChatAnthropic({
      modelName: "claude-sonnet-4-20250514",
      temperature: 0.9,
    });
    this.memoryStore = memoryStore;
  }

  async chat(userMessage: string): Promise<string> {
    const iteration = this.memoryStore.getIterationCount();
    const context = this.memoryStore.getStoryContext();

    const systemPrompt = this.getSystemPrompt(iteration);

    const messages = [
      new SystemMessage(systemPrompt),
      new HumanMessage(`Context: ${context}\n\nKid says: ${userMessage}`)
    ];

    const response = await this.llm.invoke(messages);
    return response.content as string;
  }

  private getSystemPrompt(iteration: number): string {
    if (iteration === 0) {
      return "Ask the kid about their story idea in a fun, encouraging way.";
    } else {
      return "Based on the previous panel, ask what happens next. Be encouraging and creative.";
    }
  }
}