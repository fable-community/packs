import {
  GoogleGenerativeAI,
  DynamicRetrievalMode,
} from "@google/generative-ai";

import { captureException } from "@sentry/nextjs";

export interface RequestData {
  characterName?: string;
  mediaTitle?: string;
}

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

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
      prompt = `Create a short description for the character ${data.characterName} from ${data.mediaTitle}, keep it short and about the character personality and traits.`;
    } else if (data.characterName) {
      prompt = `Create a short description for the character ${data.characterName}, keep it short and about the character personality and traits.`;
    } else if (data.mediaTitle) {
      prompt = `Create a short description for ${data.mediaTitle}`;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Internal Server Error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction:
        "You are a multimedia encyclopedia. Only write back the answers.",
      tools: [
        {
          googleSearchRetrieval: {
            dynamicRetrievalConfig: {
              mode: DynamicRetrievalMode.MODE_DYNAMIC,
              dynamicThreshold: 0.3,
            },
          },
        },
      ],
    });

    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });

    const result = await chatSession.sendMessage(prompt);

    return new Response(
      JSON.stringify({
        content: result.response.text() + "\n\n(Generated by AI)",
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
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
