import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function summarizeFile(fileName: string, fileType: string, contentBase64?: string): Promise<string> {
  try {
    const model = ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: contentBase64 ? [
        {
          inlineData: {
            mimeType: fileType,
            data: contentBase64
          }
        },
        {
          text: `Please provide a concise summary of this file named "${fileName}". If it's an image, describe it. If it's a document, summarize the key points.`
        }
      ] : `Please provide a summary for a file named "${fileName}" of type "${fileType}". Since I don't have the full content, just explain what this type of file usually contains.`,
      config: {
        systemInstruction: "You are a helpful assistant that summarizes files for a cloud storage app. Keep summaries concise and professional."
      }
    });

    const response = await model;
    return response.text || "No summary generated.";
  } catch (error) {
    console.error("Gemini summarization error:", error);
    return "Summary unavailable.";
  }
}
