import type { Config } from 'tailwindcss';

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': 'var(--bg-primary)',
        'bg-secondary': 'var(--bg-secondary)',
        'fg-primary': 'var(--fg-primary)',
        'fg-secondary': 'var(--fg-secondary)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
} satisfies Config;
