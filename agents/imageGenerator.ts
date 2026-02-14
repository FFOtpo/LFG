import OpenAI from "openai";

export class ImageGenerator {
  private openai: OpenAI;

  constructor(apiKey?: string) {
    this.openai = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
    });
  }

  async generate(prompt: string): Promise<string> {
    try {
      const response = await this.openai.images.generate({
        model: "gpt-image-1-mini",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "low",
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

}