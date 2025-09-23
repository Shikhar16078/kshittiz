import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        '2xl': '1400px',
      },
      fontFamily: {
        body: ['Inter', 'sans-serif'],
        headline: ['Space Grotesk', 'sans-serif'],
        code: ['monospace'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        'neon-ring': {
          '0%': {
            transform: 'rotate(0deg)',
            boxShadow:
              '0 0 5px hsl(var(--primary) / 0.8), 0 0 10px hsl(var(--primary) / 0.8), 0 0 20px hsl(var(--primary) / 0.6), 0 0 30px hsl(var(--primary) / 0.4), 0 0 40px hsl(var(--primary) / 0.2)',
          },
          '50%': {
            boxShadow:
              '0 0 10px hsl(var(--primary) / 0.8), 0 0 20px hsl(var(--primary) / 0.8), 0 0 30px hsl(var(--primary) / 0.6), 0 0 40px hsl(var(--primary) / 0.4), 0 0 50px hsl(var(--primary) / 0.2)',
          },
          '100%': {
            transform: 'rotate(360deg)',
            boxShadow:
              '0 0 5px hsl(var(--primary) / 0.8), 0 0 10px hsl(var(--primary) / 0.8), 0 0 20px hsl(var(--primary) / 0.6), 0 0 30px hsl(var(--primary) / 0.4), 0 0 40px hsl(var(--primary) / 0.2)',
          },
        },
        'breathing-neon': {
          '0%, 100%': {
            boxShadow:
              '0 0 10px hsl(var(--glow) / 0.4), 0 0 20px hsl(var(--glow) / 0.4), 0 0 30px hsl(var(--glow) / 0.3), 0 0 40px hsl(var(--glow) / 0.2)',
          },
          '50%': {
            boxShadow:
              '0 0 20px hsl(var(--glow) / 0.8), 0 0 30px hsl(var(--glow) / 0.8), 0 0 40px hsl(var(--glow) / 0.6), 0 0 50px hsl(var(--glow) / 0.4)',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'neon-ring': 'neon-ring 4s linear infinite',
        'breathing-neon': 'breathing-neon 3s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
