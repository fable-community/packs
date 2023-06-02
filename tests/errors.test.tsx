import { renderToString } from 'preact-render-to-string';

import { assertSnapshot } from '$std/testing/snapshot.ts';

import _404 from '../src/routes/_404.tsx';
import _500 from '../src/routes/_500.tsx';

Deno.test('/404', async (test) => {
  await assertSnapshot(
    test,
    renderToString(_404()),
  );
});

Deno.test('/500', async (test) => {
  await assertSnapshot(
    test,
    renderToString(_500()),
  );
});
