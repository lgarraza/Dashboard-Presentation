/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Vercel/Linear-style neutral SaaS palette
        primary: '#3B82F6',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        accent: '#8B5CF6',
        foreground: '#0A0A0A',
        muted: '#6B7280',
        'muted-bg': '#F9FAFB',
        'card-border': '#E5E7EB',
        // Kept for any leftover dark-surface usage
        'surface-dark': '#1F2937',
        'card-dark': '#374151',
        'text-dark': '#1F2937',
        'text-light': '#F9FAFB',
      },
      transitionDuration: {
        DEFAULT: '150ms',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(1.2)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 300ms ease-out',
        'pulse-dot': 'pulse-dot 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
