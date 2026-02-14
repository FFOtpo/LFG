import OpenAI from "openai";

export class ImageGenerator {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generate(prompt: string): Promise<string> {
    try {
      const response = await this.openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
      });

      const url = response.data?.[0]?.url;
      if (!url) throw new Error("No image URL generated");
      return url;
    } catch (error) {
      console.error("Image generation failed:", error);
      // Return placeholder on error
      return "https://via.placeholder.com/1024x1024?text=Comic+Panel";
    }
  }

  async generateMultiple(prompts: string[]): Promise<string[]> {
    const promises = prompts.map(prompt => this.generate(prompt));
    return Promise.all(promises);
  }
}