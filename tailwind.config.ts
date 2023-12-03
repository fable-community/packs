import { type Config } from 'tailwindcss';

export default {
  content: [
    '{routes,islands,components}/**/*.{ts,tsx}',
  ],
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
} as Config;
