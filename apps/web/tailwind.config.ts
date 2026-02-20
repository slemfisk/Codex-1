import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#09090b',
        panel: '#18181b',
        accent: '#34d399'
      }
    }
  },
  plugins: []
} satisfies Config;
