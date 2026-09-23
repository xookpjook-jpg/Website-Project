module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"] ,
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter", "sans-serif"]
      },
      colors: {
        primary: '#6366F1',
        secondary: '#8B5CF6',
        success: '#22C55E',
        danger: '#EF4444',
        warning: '#F59E0B',
        bg: '#0B1120',
        card: '#111827',
        border: '#1F2937'
      },
      borderRadius: {
        xl: '20px'
      }
    }
  },
  plugins: []
}
