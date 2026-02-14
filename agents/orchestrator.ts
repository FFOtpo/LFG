import { ConversationAgent } from './conversationAgent';
import { StoryBuilder } from './storyBuilder';
import { ImageGenerator } from './imageGenerator';
import { ComicAssembler } from './comicAssembler';
import { MemoryStore } from './memoryStore';

export interface OrchestratorConfig {
  maxIterations?: number;
  sessionId: string;
  elevenLabsApiKey: string;
  openAIApiKey: string;
}

export class ComicOrchestrator {
  private conversationAgent: ConversationAgent;
  private storyBuilder: StoryBuilder;
  private imageGenerator: ImageGenerator;
  private comicAssembler: ComicAssembler;
  private memoryStore: MemoryStore;
  private maxIterations: number;

  constructor(config: OrchestratorConfig) {
    this.maxIterations = config.maxIterations || 5;
    this.memoryStore = new MemoryStore(config.sessionId);
    this.conversationAgent = new ConversationAgent(this.memoryStore, config.elevenLabsApiKey, config.openAIApiKey);
    this.storyBuilder = new StoryBuilder(this.memoryStore, config.openAIApiKey);
    this.imageGenerator = new ImageGenerator(config.openAIApiKey);
    this.comicAssembler = new ComicAssembler();
  }

  async handleUserMessage(message: string): Promise<{
    response: string;
    audioBase64?: string;
    imageUrl?: string;
    isDone: boolean;
    finalComic?: string;
  }> {
    const currentIteration = this.memoryStore.getIterationCount();

    // Check if we're done
    if (currentIteration >= this.maxIterations) {
      const comicPath = await this.finalize();
      return {
        response: "🎉 Your amazing comic is ready!",
        isDone: true,
        finalComic: comicPath
      };
    }

    // Step 1: Get conversational response
    const conversationResult = await this.conversationAgent.chat(message);

    // Step 2: Extract story elements and build narrative
    const storyData = await this.storyBuilder.extractAndBuild(message);

    // Step 3: Generate image for this panel
    // Note: ImageGenerator might need OpenAI key too if it uses DALL-E, but currently it might be using env var or not updated yet.
    // Assuming ImageGenerator uses process.env or has its own config for now.
    const imageUrl = await this.imageGenerator.generate(storyData.imagePrompt);

    // Step 4: Save panel
    this.memoryStore.addPanel({
      narration: storyData.narration,
      imageUrl: imageUrl,
      userInput: message
    });

    this.memoryStore.incrementIteration();

    return {
      response: conversationResult.text,
      audioBase64: conversationResult.audioBase64,
      imageUrl: imageUrl,
      isDone: false
    };
  }

  async finalize(): Promise<string> {
    const panels = this.memoryStore.getAllPanels();
    const comicPath = await this.comicAssembler.createComic(panels);
    return comicPath;
  }

  reset() {
    this.memoryStore.reset();
  }
}