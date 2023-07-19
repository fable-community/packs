/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />

import { load } from '$std/dotenv/mod.ts';

await load({
  allowEmptyValues: true,
  defaultsPath: '.env.example',
  examplePath: null,
  export: true,
});

import { type Manifest, start } from '$fresh/server.ts';

import * as app from './src/routes/_app.tsx';
import * as index from './src/routes/index.tsx';
import * as callback from './src/routes/callback.tsx';

import * as Manage from './src/components/Manage.tsx';

import * as _404 from './src/routes/_404.tsx';
import * as _500 from './src/routes/_500.tsx';

import * as login from './src/api/login.ts';
import * as logout from './src/api/logout.ts';
import * as publish from './src/api/publish.ts';

const manifest: Manifest = {
  baseUrl: import.meta.url,
  islands: {
    // islands enable client-side interactivity
    './src/components/Manage.tsx': Manage,
  },
  routes: {
    // main template
    './routes/_app.tsx': app,
    // pages
    './routes/callback.tsx': callback,
    './routes/index.tsx': index,
    './routes/[id].tsx': index,
    // errors
    './routes/_404.tsx': _404,
    './routes/_500.tsx': _500,
    // api
    './routes/api/login.ts': login,
    './routes/api/logout.ts': logout,
    './routes/api/publish.ts': publish,
  },
};

await start(manifest, {
  port: 8080,
});
