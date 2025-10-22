/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        neonBlue: "#00ffff",
        neonPink: "#ff00ff",
        neonPurple: "#b026ff",
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
      boxShadow: {
        neonBlue: "0 0 15px #00ffff55",
        neonPink: "0 0 15px #ff00ff55",
        neonGlow: "0 0 25px #00ffff88",
      },
    },
  },
  plugins: [],
};
