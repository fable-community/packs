import { defineConfig } from '$fresh/server.ts';

import twindPlugin from '$fresh/plugins/twindv1.ts';
import twindConfig from './twind.config.ts';

import { plugin } from './utils/oauth.ts';

export default defineConfig({
  port: 8080,
  plugins: [plugin, twindPlugin(twindConfig)],
});
