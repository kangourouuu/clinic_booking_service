/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/App.jsx",
        "./src/main.jsx",
        "./src/components/**/*.{js,ts,jsx,tsx}",
        "./src/pages/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Primary Medical Blue - Professional and Trustworthy
                primary: {
                    50: '#f0f9ff',
                    100: '#e0f2fe',
                    200: '#bae6fd',
                    300: '#7dd3fc',
                    400: '#38bdf8',
                    500: '#0ea5e9',
                    600: '#0284c7',
                    700: '#0369a1',
                    800: '#075985',
                    900: '#0c4a6e',
                    950: '#082f49',
                },
                // Medical Teal - Healing and Calm
                teal: {
                    50: '#f0fdfa',
                    100: '#ccfbf1',
                    200: '#99f6e4',
                    300: '#5eead4',
                    400: '#2dd4bf',
                    500: '#14b8a6',
                    600: '#0d9488',
                    700: '#0f766e',
                    800: '#115e59',
                    900: '#134e4a',
                    950: '#042f2e',
                },
                // Success Green - Health and Wellness
                success: {
                    50: '#f0fdf4',
                    100: '#dcfce7',
                    200: '#bbf7d0',
                    300: '#86efac',
                    400: '#4ade80',
                    500: '#22c55e',
                    600: '#16a34a',
                    700: '#15803d',
                    800: '#166534',
                    900: '#14532d',
                },
                // Warning Amber - Caution
                warning: {
                    50: '#fffbeb',
                    100: '#fef3c7',
                    200: '#fde68a',
                    300: '#fcd34d',
                    400: '#fbbf24',
                    500: '#f59e0b',
                    600: '#d97706',
                    700: '#b45309',
                    800: '#92400e',
                    900: '#78350f',
                },
                // Error Red - Critical
                error: {
                    50: '#fef2f2',
                    100: '#fee2e2',
                    200: '#fecaca',
                    300: '#fca5a5',
                    400: '#f87171',
                    500: '#ef4444',
                    600: '#dc2626',
                    700: '#b91c1c',
                    800: '#991b1b',
                    900: '#7f1d1d',
                },
                // Medical specific colors
                medical: {
                    blue: '#0284c7',
                    lightBlue: '#e0f2fe',
                    teal: '#14b8a6',
                    lightTeal: '#ccfbf1',
                    green: '#22c55e',
                    lightGreen: '#dcfce7',
                    purple: '#8b5cf6',
                    lightPurple: '#ede9fe',
                    gray: '#64748b',
                    lightGray: '#f8fafc',
                }
            },
            fontFamily: {
                sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
                medical: ['Poppins', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
                display: ['Lexend', 'Inter', 'sans-serif'],
            },
            backgroundImage: {
                'medical-pattern': "url('data:image/svg+xml,<svg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"><g fill=\"none\" fill-rule=\"evenodd\"><g fill=\"%23e0f2fe\" fill-opacity=\"0.15\"><path d=\"M30 28h4v4h-4zM26 28h4v4h-4zM30 32h4v4h-4zM26 32h4v4h-4z\"/></g></svg>')",
                'medical-hero': "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%)",
                'medical-gradient': "linear-gradient(to bottom right, #0ea5e9, #14b8a6)",
                'medical-gradient-soft': "linear-gradient(to bottom right, #f0f9ff, #f0fdfa)",
                'medical-cross': "url('data:image/svg+xml,<svg width=\"40\" height=\"40\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M15 10h10v10h5v10h-10v10h-10v-10h-5v-10h5z\" fill=\"%230ea5e9\" opacity=\"0.05\"/></svg>')",
            },
            boxShadow: {
                'medical': '0 4px 6px -1px rgba(14, 165, 233, 0.1), 0 2px 4px -1px rgba(14, 165, 233, 0.06)',
                'medical-lg': '0 10px 15px -3px rgba(14, 165, 233, 0.1), 0 4px 6px -2px rgba(14, 165, 233, 0.05)',
                'medical-xl': '0 20px 25px -5px rgba(14, 165, 233, 0.1), 0 10px 10px -5px rgba(14, 165, 233, 0.04)',
                'soft': '0 2px 8px 0 rgba(0, 0, 0, 0.08)',
                'soft-lg': '0 4px 16px 0 rgba(0, 0, 0, 0.1)',
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-in-out',
                'fade-in-up': 'fadeInUp 0.6s ease-out',
                'slide-in': 'slideIn 0.6s ease-out',
                'slide-in-right': 'slideInRight 0.5s ease-out',
                'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'bounce-soft': 'bounceSoft 1s ease-in-out infinite',
                'scale-in': 'scaleIn 0.3s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(30px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideIn: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                slideInRight: {
                    '0%': { transform: 'translateX(-20px)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                },
                pulseSoft: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.7' },
                },
                bounceSoft: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-5px)' },
                },
                scaleIn: {
                    '0%': { transform: 'scale(0.9)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
            },
            borderRadius: {
                'medical': '0.75rem',
                'medical-lg': '1rem',
            },
            spacing: {
                '18': '4.5rem',
                '88': '22rem',
                '112': '28rem',
                '128': '32rem',
            },
        },
    },
    plugins: [],
}
