import { renderToString } from 'preact-render-to-string';

import { assertSnapshot } from '$std/testing/snapshot.ts';

import { stub } from '$std/testing/mock.ts';

import Manage from '../src/components/Manage.tsx';

import mock from './mock.json' assert { type: 'json' };

Deno.test('<Manage new/>', async (test) => {
  const mathStub = stub(Math, 'random', () => 0);

  try {
    await assertSnapshot(
      test,
      renderToString(<Manage new user={'current_id'} />),
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
      renderToString(
        <Manage
          pack={{
            manifest: { maintainers: ['id1', 'id2'], ...mock },
            owner: 'owner_id',
            // deno-lint-ignore no-explicit-any
          } as any}
          user={'user_id'}
        />,
      ),
    );
  } finally {
    mathStub.restore();
  }
});
