// deno-lint-ignore-file no-external-import

import { defineConfig, Preset } from 'https://esm.sh/@twind/core@1.1.3';
import presetTailwind from 'https://esm.sh/@twind/preset-tailwind@1.1.4';
import presetAutoprefix from 'https://esm.sh/@twind/preset-autoprefix@1.0.7';

export default {
  ...defineConfig({
    presets: [presetTailwind() as Preset, presetAutoprefix()],
    theme: {
      extend: {
        colors: {
          grey: 'var(--grey)',
          white: ' var(--foreground)',
          background: 'var(--background)',
          embed: 'var(--embed)',
          embed2: 'var(--embedHighlight)',
          highlight: 'var(--highlight)',
          red: 'var(--red)',
          discord: 'var(--discord)',
          fable: 'var(--fable)',
          disabled: 'var(--disabled)',
        },
      },
    },
  }),
  //
  selfURL: import.meta.url,
};
