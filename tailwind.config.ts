import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'navy': {
          '900': '#0A0F1C',
          '800': '#141B2D',
          '700': '#1F2937',
        },
        'cyan': {
          '400': '#22D3EE',
          '500': '#06B6D4',
        },
      },
    },
  },
  plugins: [],
}
export default config 