import type { Handlers } from '$fresh/server.ts';

const ACCOUNT_ID = Deno.env.get('CF_ACCOUNT_ID');
const API_TOKEN = Deno.env.get('CF_AI_TOKEN');

export interface Data {
  characterName?: string;
  mediaTitle?: string;
}

const MODEL_ID = '@hf/google/gemma-7b-it';

export const handler: Handlers = {
  async POST(req): Promise<Response> {
    const data: Data = await req.json();

    let prompt = '';

    if (data.characterName && data.mediaTitle) {
      prompt =
        prompt =
          `Create a short description for the character ${data.characterName} from ${data.mediaTitle}`;
    } else if (data.characterName) {
      prompt =
        `Create a short description for the character ${data.characterName}`;
    } else if (data.mediaTitle) {
      prompt = `Create a short description for ${data.mediaTitle}`;
    } else {
      return new Response('Character Name/Media Title not defined', {
        status: 400,
      });
    }

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run/${MODEL_ID}`,
      {
        method: 'POST',
        headers: { 'authorization': `Bearer ${API_TOKEN}` },
        body: JSON.stringify({
          max_tokens: 1024,
          prompt,
        }),
      },
    );

    const res: { result?: { response?: string }; success: boolean } =
      await response.json();

    if (!res.success || !res.result?.response) {
      return new Response('Internal Server Error', { status: 500 });
    }

    return new Response(res.result.response, {
      status: response.status,
      statusText: response.statusText,
    });
  },
};
