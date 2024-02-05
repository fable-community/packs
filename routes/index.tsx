import { Handlers } from '$fresh/server.ts';

export const handler: Handlers = {
  GET(req, ctx) {
    return new Response(null, {
      status: 302,
      headers: {
        Location: '/browse',
      },
    });
  },
};
