import { defineConfig } from '$fresh/server.ts';

import { plugin } from './utils/oauth.ts';

export default defineConfig({
  port: 8080,
  plugins: [plugin],
});
