import { signal } from '@preact/signals';

import { IS_BROWSER } from '$fresh/runtime.ts';

import enUS from '../i18n/en-US.ts';
import esES from '../i18n/es-ES.ts';

export const locale = signal('en-US');

const regex = /((([a-zA-Z]+(-[a-zA-Z0-9]+){0,2})|\*)(;q=[0-1](\.[0-9]+)?)?)*/g;

export const availableLocales = [
  'en',
  'en-US',
  'es',
  'es-ES',
];

export function i18nSSR(acceptHeader: string) {
  const langs = acceptHeader.match(regex) ?? [];

  const options = langs.map((lang) => {
    if (!lang) {
      return;
    }

    const l = lang.split(';');

    return {
      locale: l[0],
      quality: l[1] ? parseFloat(l[1].split('=')[1]) : 1.0,
    };
  })
    .filter(Boolean)
    .filter((l) => availableLocales.includes(l.locale))
    .sort((a, b) => b.quality - a.quality);

  if (options.length > 0) {
    locale.value = options[0].locale;
  }
}

export function i18n(
  key: keyof typeof enUS,
  ...args: (string | number)[]
): string {
  let value: string | string[];

  // on browser the signal would not have been updated from i18nSSR()
  if (IS_BROWSER) {
    locale.value = navigator.languages[0];
  }

  switch (locale.value) {
    case 'es':
    case 'es-ES':
      value = esES[key];
      break;
    default:
      value = enUS[key];
      break;
  }

  if (typeof value === 'string' && args?.length) {
    value = value.replaceAll(
      /{(\d+)}/g,
      (match, i) => typeof args[i] !== 'undefined' ? `${args[i]}` : match,
    );
  }

  // deno-lint-ignore no-explicit-any
  return value as any;
}
