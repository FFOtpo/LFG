import OpenAI from "openai";
import { IMAGE_PROMPT } from "./prompt/imagePrompt";

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
        prompt: IMAGE_PROMPT + "\n\n" + prompt,
        n: 1,
        size: "1024x1024",
        quality: "low",
      });

      const b64Json = response.data?.[0]?.b64_json;
      if (!b64Json) {
        console.error("OpenAI Response missing b64_json:", JSON.stringify(response, null, 2));
        throw new Error("No image data generated");
      }
      return `data:image/png;base64,${b64Json}`;
    } catch (error) {
      console.error("Image generation failed:", error);
      // Return placeholder on error
      return "https://via.placeholder.com/1024x1024?text=Comic+Panel";
    }
  }

}