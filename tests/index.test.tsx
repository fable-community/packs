import { renderToString } from 'preact-render-to-string';

import { assertSnapshot } from '$std/testing/snapshot.ts';

import Index from '../routes/index.tsx';

import { stub } from '$std/testing/mock.ts';

Deno.test('<Index/>', async (test) => {
  const mathStub = stub(
    Math,
    'random',
    () => 0,
  );

  try {
    const url = new URL('http://localhost:8080');

    await assertSnapshot(
      test,
      renderToString(<Index params={{}} route={''} url={url} data={{}} />),
    );
  } finally {
    mathStub.restore();
  }
});

Deno.test('<Index/> (Logged In)', async (test) => {
  const mathStub = stub(
    Math,
    'random',
    () => 0,
  );

  try {
    const url = new URL('http://localhost:8080');

    await assertSnapshot(
      test,
      renderToString(
        <Index
          params={{}}
          route={''}
          url={url}
          data={{
            id: 'user_id',
            avatar: 'avatar_hash',
            username: 'user_username',
          }}
        />,
      ),
    );
  } finally {
    mathStub.restore();
  }
});

Deno.test('<Index/> (Logged In) (No Avatar)', async (test) => {
  const mathStub = stub(
    Math,
    'random',
    () => 0,
  );

  try {
    const url = new URL('http://localhost:8080');

    await assertSnapshot(
      test,
      renderToString(
        <Index
          params={{}}
          route={''}
          url={url}
          data={{
            id: 'user_id',
            username: 'user_username',
          }}
        />,
      ),
    );
  } finally {
    mathStub.restore();
  }
});
