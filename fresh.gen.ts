// DO NOT EDIT. This file is generated by Fresh.
// This file SHOULD be checked into source version control.
// This file is automatically updated during development when running `dev.ts`.

import * as $_id_edit from './routes/[id]/edit.tsx';
import * as $_404 from './routes/_404.tsx';
import * as $_500 from './routes/_500.tsx';
import * as $_503 from './routes/_503.tsx';
import * as $_app from './routes/_app.tsx';
import * as $api_publish from './routes/api/publish.ts';
import * as $api_zerochan from './routes/api/zerochan.ts';
import * as $dashboard from './routes/dashboard.tsx';
import * as $index from './routes/index.tsx';
import * as $new from './routes/new.tsx';
import * as $Manage from './islands/Manage.tsx';
import { type Manifest } from '$fresh/server.ts';

const manifest = {
  routes: {
    './routes/[id]/edit.tsx': $_id_edit,
    './routes/_404.tsx': $_404,
    './routes/_500.tsx': $_500,
    './routes/_503.tsx': $_503,
    './routes/_app.tsx': $_app,
    './routes/api/publish.ts': $api_publish,
    './routes/api/zerochan.ts': $api_zerochan,
    './routes/dashboard.tsx': $dashboard,
    './routes/index.tsx': $index,
    './routes/new.tsx': $new,
  },
  islands: {
    './islands/Manage.tsx': $Manage,
  },
  baseUrl: import.meta.url,
} satisfies Manifest;

export default manifest;
