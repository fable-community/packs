import { renderToString } from 'preact-render-to-string';

import { assertSnapshot } from '$std/testing/snapshot.ts';

import { stub } from '$std/testing/mock.ts';

import Login from '../src/components/Login.tsx';

Deno.test('<Login/>', async (test) => {
  const mathStub = stub(Math, 'random', () => 0);

  try {
    await assertSnapshot(
      test,
      renderToString(<Login />),
    );
  } finally {
    mathStub.restore();
  }
});
