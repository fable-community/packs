import * as Sentry from 'sentry';

// deno-lint-ignore no-explicit-any
export function captureException(err: any) {
  const dsn = Deno.env.get('SENTRY_DSN');

  if (dsn) {
    Sentry.init({ dsn: Deno.env.get('SENTRY_DSN') });
    Sentry.captureException(err);
  }
}
