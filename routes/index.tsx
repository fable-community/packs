import { Handlers, type PageProps } from '$fresh/server.ts';

import { getAccessToken } from '~/utils/oauth.ts';

export const handler: Handlers = {
  GET(req, ctx) {
    if (getAccessToken(req)) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: '/dashboard',
        },
      });
    } else {
      return ctx.render();
    }
  },
};

export default () => {
  return <div>not logged in</div>;
};
