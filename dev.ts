import dev from '$fresh/dev.ts';
import config from './fresh.config.ts';

import { load } from '$std/dotenv/mod.ts';

await load({
  allowEmptyValues: true,
  defaultsPath: '.env.example',
  examplePath: null,
  export: true,
});

await dev(import.meta.url, './main.ts', config);
