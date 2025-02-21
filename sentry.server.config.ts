// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://dacb35e205814c16aa731b503abdc9f8@o287619.ingest.us.sentry.io/4505319310622720",

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
