import { renderToString } from 'preact-render-to-string';

import { assertSnapshot } from '$std/testing/snapshot.ts';

import { stub } from '$std/testing/mock.ts';

import Card from '../src/components/Card.tsx';
import Dashboard from '../src/components/Dashboard.tsx';

import mock from './mock.json' assert { type: 'json' };

Deno.test('<Dashboard/>', async (test) => {
  const mathStub = stub(Math, 'random', () => 0);

  try {
    await assertSnapshot(
      test,
      renderToString(
        <Dashboard
          route={'/'}
          url={new URL('http://localhost:8080')}
          params={{}}
          data={{
            user: {
              id: 'id',
              avatar: 'avatar_hash',
              username: 'username',
            },
            packs: {},
          }}
        />,
      ),
    );
  } finally {
    mathStub.restore();
  }
});

Deno.test('<Card/>', async (test) => {
  const mathStub = stub(Math, 'random', () => 0);

  try {
    await assertSnapshot(
      test,
      // deno-lint-ignore no-explicit-any
      renderToString(<Card pack={{ manifest: mock } as any} />),
    );
  } finally {
    mathStub.restore();
  }
});
