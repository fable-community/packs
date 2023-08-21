import type { Plugin } from '$fresh/server.ts';

import {
  createDiscordOAuth2Client,
  handleCallback,
  signIn,
  signOut,
} from 'kv_oauth';

export const getDiscordOAuth2Client = (req: Request) =>
  createDiscordOAuth2Client({
    defaults: { scope: ['identify'] },
    redirectUri: `${new URL(req.url).origin}/callback`,
  });

export const plugin: Plugin = {
  name: 'oauth',
  routes: [
    {
      path: '/login',
      handler: async (req) => {
        return await signIn(req, getDiscordOAuth2Client(req));
      },
    },
    {
      path: '/callback',
      handler: async (req) => {
        const { response } = await handleCallback(
          req,
          getDiscordOAuth2Client(req),
        );

        return response;
      },
    },
    {
      path: '/logout',
      handler: async (req) => await signOut(req),
    },
  ],
};
