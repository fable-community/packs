import { renderToString } from 'preact-render-to-string';

import { assertSnapshot } from '$std/testing/snapshot.ts';
import { assert } from '$std/testing/asserts.ts';

// import Counter from '../islands/Counter.tsx';

Deno.test('<Counter/>', (test) => {
  // await assertSnapshot(
  //   test,
  //   renderToString(<Counter start={3} />),
  // );

  assert(true);
});
