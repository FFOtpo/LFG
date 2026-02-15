import { ConversationAgent } from './conversationAgent';
import { StoryBuilder } from './storyBuilder';
import { ImageGenerator } from './imageGenerator';
import { ComicAssembler } from './comicAssembler';
import { MemoryStore } from './memoryStore';

export interface OrchestratorConfig {
  maxIterations?: number;
  sessionId: string;
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
    console.log("Orchestrator config:", {
      sessionId: config.sessionId,
      openAIKeyLength: config.openAIApiKey ? config.openAIApiKey.length : 0
    });
    this.maxIterations = config.maxIterations || 5;
    this.memoryStore = new MemoryStore(config.sessionId);
    this.conversationAgent = new ConversationAgent(this.memoryStore, config.openAIApiKey);
    this.storyBuilder = new StoryBuilder(this.memoryStore, config.openAIApiKey);
    this.imageGenerator = new ImageGenerator(config.openAIApiKey);
    this.comicAssembler = new ComicAssembler();
  }

  async handleUserMessage(audioBase64?: string): Promise<{
    response: string;
    audioBase64?: string;
    imageUrl?: string;
    theme?: string;
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

    let userText = "";
    if (audioBase64) {
      try {
        const audioBuffer = Buffer.from(audioBase64, 'base64');
        userText = await this.conversationAgent.transcribeAudio(audioBuffer);
        // Maybe log the transcribed text?
        console.log("Transcribed text:", userText);
      } catch (error) {
        console.error("Transcription failed, falling back to message if available", error);
        // Fallback to message if transcription fails?
        // If message is empty, we might have a problem.
        if (!userText) {
          return {
            response: "Sorry, I couldn't hear you. Can you say that again?",
            isDone: false
          };
        }
      }
    }

    // Step 1: Get conversational response
    const conversationResult = await this.conversationAgent.chat(userText);

    // Step 2: Extract story elements and build narrative
    const storyData = await this.storyBuilder.extractAndBuild(userText);

    // Step 3: Generate image for this panel
    // Note: ImageGenerator might need OpenAI key too if it uses DALL-E, but currently it might be using env var or not updated yet.
    // Assuming ImageGenerator uses process.env or has its own config for now.
    const imageUrl = await this.imageGenerator.generate(storyData.imagePrompt);

    // Step 4: Save panel
    this.memoryStore.addPanel({
      narration: storyData.narration,
      imageUrl: imageUrl,
      userInput: userText
    });

    this.memoryStore.incrementIteration();

    return {
      response: conversationResult.text,
      audioBase64: conversationResult.audioBase64,
      imageUrl: imageUrl,
      theme: storyData.theme,
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