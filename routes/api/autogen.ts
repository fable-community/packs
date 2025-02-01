import ModelClient from '@azure-rest/ai-inference';
import { AzureKeyCredential } from '@azure/core-auth';

import { captureException } from '~/utils/sentry.ts';

import type { Handlers } from '$fresh/server.ts';

const token = Deno.env.get('GITHUB_TOKEN');

export interface Data {
  characterName?: string;
  mediaTitle?: string;
}

const endpoint = 'https://models.inference.ai.azure.com';
const modelName = 'Meta-Llama-3-70B-Instruct';

export const handler: Handlers = {
  async POST(req): Promise<Response> {
    let prompt = '';

    const data: Data = await req.json();

    if (!data.characterName && !data.mediaTitle) {
      return new Response('Character Name/Media Title not defined', {
        status: 400,
      });
    }

    if (data.characterName && data.mediaTitle) {
      prompt =
        `Create a short description for the character ${data.characterName} from ${data.mediaTitle}, keep it short and about the character personality and traits.`;
    } else if (data.characterName) {
      prompt =
        `Create a short description for the character ${data.characterName}, keep it short and about the character personality and traits.`;
    } else if (data.mediaTitle) {
      prompt = `Create a short description for ${data.mediaTitle}`;
    }

    if (!token) {
      return new Response('Internal Server Error', { status: 500 });
    }

    const client = ModelClient(
      endpoint,
      new AzureKeyCredential(token),
    );

    const response = await client.path('/chat/completions').post({
      body: {
        messages: [
          { role: 'system', content: 'You are a multimedia encyclopedia.' },
          { role: 'user', content: prompt },
        ],
        temperature: 1.0,
        top_p: 1.0,
        max_tokens: 1000,
        model: modelName,
      },
    });

    if (response.status !== '200') {
      captureException(response.body.error);
      return new Response('Internal Server Error', { status: 500 });
    }

    return new Response(
      JSON.stringify({
        content: response.body.choices[0].message.content,
      }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  },
};
