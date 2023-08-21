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

import { start } from '$fresh/server.ts';

import manifest from './fresh.gen.ts';

import config from './fresh.config.ts';

await start(manifest, config);
