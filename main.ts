/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />

import '$std/dotenv/load.ts';

import { type Manifest, start } from '$fresh/server.ts';

import * as app from './src/routes/_app.tsx';
import * as index from './src/routes/index.tsx';
import * as callback from './src/routes/callback.tsx';

import * as _404 from './src/routes/_404.tsx';
import * as _500 from './src/routes/_500.tsx';

import * as login from './src/api/login.ts';
import * as logout from './src/api/logout.ts';

import config from './deno.json' assert { type: 'json' };

const manifest: Manifest = {
  config,
  baseUrl: import.meta.url,
  // islands enable client-side interactivity
  islands: {},
  routes: {
    // main template
    './routes/_app.tsx': app,
    //
    // pages
    //
    './routes/callback.tsx': callback,
    './routes/index.tsx': index,
    './routes/[id].tsx': index,
    //
    // errors
    //
    './routes/_404.tsx': _404,
    './routes/_500.tsx': _500,
    //
    // api
    //
    './routes/api/login.ts': login,
    './routes/api/logout.ts': logout,
  },
};

await start(manifest, { port: 8080 });
