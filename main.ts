/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />

import '$std/dotenv/load.ts';

import { Manifest, start } from '$fresh/server.ts';

import config from './deno.json' assert { type: 'json' };

import * as app from './routes/_app.tsx';
import * as index from './routes/index.tsx';
import * as callback from './routes/callback.tsx';

import * as login from './routes/api/login.ts';
import * as logout from './routes/api/logout.ts';

const manifest: Manifest = {
  config,
  baseUrl: import.meta.url,
  islands: {
    // Islands enable client-side interactivity
  },
  routes: {
    // pages
    './routes/_app.tsx': app,
    './routes/index.tsx': index,
    './routes/callback.tsx': callback,
    // api
    './routes/api/login.ts': login,
    './routes/api/logout.ts': logout,
  },
};

await start(manifest, { port: 8080 });
