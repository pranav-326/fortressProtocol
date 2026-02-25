/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                cyber: {
                    bg: '#0a0a0f',
                    surface: '#151520',
                    accent: '#00f0ff',
                    danger: '#ff0055',
                    warning: '#ffaa00',
                    success: '#00ffaa'
                }
            }
        },
    },
    plugins: [],
}
