import { renderToString } from 'preact-render-to-string';

import { assertSnapshot } from '$std/testing/snapshot.ts';

import { stub } from '$std/testing/mock.ts';

import Manage from '../src/components/Manage.tsx';

import mock from './mock.json' assert { type: 'json' };

Deno.test('<Manage pack={undefined}/>', async (test) => {
  const mathStub = stub(Math, 'random', () => 0);

  try {
    await assertSnapshot(
      test,
      renderToString(<Manage pack={undefined} />),
    );
  } finally {
    mathStub.restore();
  }
});

Deno.test('<Manage pack={pack}/>', async (test) => {
  const mathStub = stub(Math, 'random', () => 0);

  try {
    await assertSnapshot(
      test,
      // deno-lint-ignore no-explicit-any
      renderToString(<Manage pack={{ manifest: mock } as any} />),
    );
  } finally {
    mathStub.restore();
  }
});
