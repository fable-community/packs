import { GoogleGenAI, HarmBlockThreshold, HarmCategory } from "@google/genai";

import { captureException } from "@sentry/nextjs";

export interface RequestData {
  characterName?: string;
  mediaTitle?: string;
}

export async function POST(request: Request) {
  try {
    const data: RequestData = await request.json();

    if (!data.characterName && !data.mediaTitle) {
      return new Response(
        JSON.stringify({ error: "Character Name/Media Title not defined" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    let prompt = "";
    if (data.characterName && data.mediaTitle) {
      prompt = `Create a short description for the character ${data.characterName} from ${data.mediaTitle}, keep it focused on the character personality traits, and backstory.`;
    } else if (data.characterName) {
      prompt = `Create a for the character ${data.characterName}, keep it focused on the character personality traits, and backstory.`;
    } else if (data.mediaTitle) {
      prompt = `Create a short description for ${data.mediaTitle}, keep it short and focused on the story, characters, setting and themes.`;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Internal Server Error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-001",
      contents: prompt,
      config: {
        maxOutputTokens: 8192,
        responseMimeType: "text/plain",
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
        ],
        tools: [
          {
            googleSearch: {},
          },
        ],
        systemInstruction:
          "You are a multimedia encyclopedia. Only write back the answers. And only write back the answers. Do not ask questions or provide any additional information.",
      },
    });

    return new Response(
      JSON.stringify({ content: response.text + "\n\n(Generated by AI)" }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    captureException(err);
    console.error(err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
