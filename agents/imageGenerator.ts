import { GoogleGenAI } from "@google/genai";
import { IMAGE_PROMPT } from "./prompt/imagePrompt";

export class ImageGenerator {
  private ai: GoogleGenAI;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.GOOGLE_API_KEY;
    if (!key) {
      console.warn("GOOGLE_API_KEY is not set. Image generation may fail unless provided otherwise.");
    }
    this.ai = new GoogleGenAI({ apiKey: key });
  }

  async generate(prompt: string): Promise<string> {
    try {
      const fullPrompt = IMAGE_PROMPT + "\n\n" + prompt;

      const response = await this.ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: [
          {
            parts: [
              { text: fullPrompt }
            ]
          }
        ],
        config: {
          responseModalities: ['IMAGE'],
          imageConfig: {
            aspectRatio: '1:1',
            imageSize: '1024x1024',
          },
        },
      });

      // Extract image from response which is typically in candidates[0].content.parts
      // The snippet suggests inlineData might be present
      for (const candidate of response.candidates || []) {
        for (const part of candidate.content?.parts || []) {
          if (part.inlineData) {
            const mimeType = part.inlineData.mimeType || "image/png";
            const data = part.inlineData.data;
            return `data:${mimeType};base64,${data}`;
          }
        }
      }

      console.error("No image data found in Google GenAI response");
      throw new Error("No image data generated");

    } catch (error) {
      console.error("Image generation failed:", error);
      // Return placeholder on error
      return "https://via.placeholder.com/1024x1024?text=Comic+Panel";
    }
  }

}