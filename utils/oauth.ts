import type { Plugin } from '$fresh/server.ts';

import {
  createDiscordOAuth2Client,
  handleCallback,
  signIn,
  signOut,
} from 'kv_oauth/mod.ts';

export const oauthClient = (req: Request) =>
  createDiscordOAuth2Client({
    defaults: { scope: ['identify'] },
    redirectUri: `${new URL(req.url).origin}/callback`,
  });

export const plugin: Plugin = {
  name: 'kv-oauth',
  routes: [
    {
      path: '/login',
      handler: async (req) => {
        return await signIn(req, oauthClient(req));
      },
    },
    {
      path: '/callback',
      handler: async (req) => {
        const { response } = await handleCallback(req, oauthClient(req));
        return response;
      },
    },
    {
      path: '/logout',
      handler: signOut,
    },
  ],
};
