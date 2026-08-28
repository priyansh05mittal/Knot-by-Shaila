/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FFF8F0',
        'cream-deep': '#FBF0E4',
        beige: '#E8D5C4',
        'beige-dark': '#D9C0A8',
        rose: {
          DEFAULT: '#D8A7B1',
          light: '#EBC9CF',
          dark: '#C2818E',
        },
        blush: '#C97B84',
        brown: {
          DEFAULT: '#6B4F4F',
          deep: '#4A3B3B',
          light: '#8A6B6B',
        },
        ink: '#4A3B3B',
        cloud: '#FDFBF8',
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Quicksand"', 'sans-serif'],
        label: ['"Poppins"', 'sans-serif'],
      },
      borderRadius: {
        cozy: '1.25rem',
        stitch: '2rem',
      },
      boxShadow: {
        soft: '0 4px 24px rgba(107, 79, 79, 0.08)',
        lift: '0 12px 32px rgba(107, 79, 79, 0.16)',
        inset: 'inset 0 0 0 1px rgba(107, 79, 79, 0.08)',
      },
      keyframes: {
        floaty: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        stitchDraw: {
          from: { strokeDashoffset: '1000' },
          to: { strokeDashoffset: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      animation: {
        floaty: 'floaty 4s ease-in-out infinite',
        stitchDraw: 'stitchDraw 2s ease forwards',
        shimmer: 'shimmer 2s infinite linear',
      },
    },
  },
  plugins: [],
};
