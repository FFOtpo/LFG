import { ConversationAgent } from './agents/conversationAgent';
import { StoryBuilder } from './agents/storyBuilder';
import { ImageGenerator } from './agents/imageGenerator';
import { ComicAssembler } from './agents/comicAssembler';
import { MemoryStore } from './store/memoryStore';

export interface OrchestratorConfig {
  maxIterations?: number;
  sessionId: string;
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
    this.conversationAgent = new ConversationAgent(this.memoryStore);
    this.storyBuilder = new StoryBuilder(this.memoryStore);
    this.imageGenerator = new ImageGenerator();
    this.comicAssembler = new ComicAssembler();
  }

  async handleUserMessage(message: string): Promise<{
    response: string;
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
    const conversationResponse = await this.conversationAgent.chat(message);
    
    // Step 2: Extract story elements and build narrative
    const storyData = await this.storyBuilder.extractAndBuild(message);
    
    // Step 3: Generate image for this panel
    const imageUrl = await this.imageGenerator.generate(storyData.imagePrompt);
    
    // Step 4: Save panel
    this.memoryStore.addPanel({
      narration: storyData.narration,
      imageUrl: imageUrl,
      userInput: message
    });

    this.memoryStore.incrementIteration();

    return {
      response: conversationResponse,
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