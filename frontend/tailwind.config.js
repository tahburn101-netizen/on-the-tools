/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
    theme: {
        extend: {
            fontFamily: {
                heading: ['Anton', 'Impact', 'sans-serif'],
                body: ['Barlow', 'system-ui', 'sans-serif'],
            },
            colors: {
                neon: {
                    DEFAULT: '#C6FF00',
                    hover: '#AEE500',
                    soft: '#E4FF7A',
                },
                ink: {
                    DEFAULT: '#000000',
                    900: '#0A0A0A',
                    800: '#111111',
                    700: '#1A1A1A',
                    600: '#222222',
                },
                metal: {
                    DEFAULT: '#D1D5DB',
                    dim: '#9CA3AF',
                },
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
                popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
                primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
                secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
                muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
                accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
                destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
            },
            keyframes: {
                'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
                'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
                'marquee': { '0%': { transform: 'translateX(0%)' }, '100%': { transform: 'translateX(-50%)' } },
                'spark': {
                    '0%': { transform: 'translate(0,0) scale(1)', opacity: '1' },
                    '100%': { transform: 'translate(var(--tx),var(--ty)) scale(0)', opacity: '0' },
                },
                'pulse-neon': {
                    '0%, 100%': { boxShadow: '0 0 0 0 rgba(198,255,0,0.6)' },
                    '50%': { boxShadow: '0 0 24px 6px rgba(198,255,0,0.0)' },
                },
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                'marquee': 'marquee 35s linear infinite',
                'pulse-neon': 'pulse-neon 2.4s ease-in-out infinite',
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
};
