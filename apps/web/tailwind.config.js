/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx,js,jsx}",
    "./components/**/*.{ts,tsx,js,jsx}",
    "./pages/**/*.{ts,tsx,js,jsx}",
    // If we ever import UI from packages, keep this too:
    "../../packages/**/*.{ts,tsx,js,jsx}"
  ],
  safelist: [
    "bg-brand", "hover:bg-brand-hover",
    "text-brand", "hover:text-brand-hover",
    "bg-brand/5", "border-brand/20"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#0A5C63", // Veriff Dark Teal
          hover: "#084A50",
          50: "#E6F5F6",
          100: "#CCF0F2",
          200: "#99E0E5",
          300: "#66D1D8",
          400: "#33C1CB",
          500: "#0A5C63",
          600: "#084A50",
          700: "#06383D",
          800: "#04262A",
          900: "#021317"
        }
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem"
      },
      boxShadow: {
        soft: "0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(16,24,40,0.06)",
        veriff: "0 2px 8px rgba(10,92,99,0.12), 0 8px 24px rgba(10,92,99,0.08)"
      }
    }
  },
  plugins: []
};

