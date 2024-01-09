/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/frontend/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: "420px",
      },
      colors: {
        primary: {
          50: "#CCE7FB",
          100: "#cce7fb",
          200: "#99cef7",
          300: "#66b6f2",
          400: "#339DEE",
          500: "#0085ea",
          600: "#006abb",
          700: "#00508c",
          800: "#00355e",
          900: "#001b2f",
        },
        dark: {
          50: "#BABEC5",
          100: "#A2A7B0",
          400: "#313A44",
          500: "#262E36",
          600: "#1F262E",
          700: "#151B20",
          800: "#101519",
          900: "#0C1114",
        },
        twitter: "#0085EA",
        discord: "#5865F2",
        neutral: {
          50: "#F8FAFC",
          200: "#CFD0D1",
          400: "#87898C",
          500: "#6E7174",
          700: "#3E4146",
          800: "#262A2F",
          900: "#0E1218",
        },
        error: {
          50: "#FEF2F2",
          500: "#EF4444",
          800: "#991B1B",
        },
        success: {
          50: "#ECFDF5",
          500: "#10B981",
          800: "#065F46",
        },
      },
      backgroundImage: {
        box: "linear-gradient(103deg, #111B2E 18%, #16233A 49.8%)",
        tooltip: "linear-gradient(103deg, #1A2E52 18%, #1D2E4D 49.8%)",
      },
      boxShadow: {
        "3xl": "0px 5px 10px rgba(14, 18, 24, 0.5)",
        btn: "0px 0px 10px 0px rgba(0, 133, 234, 0.30)",
        tooltip: "0px 5px 10px 0px rgba(14, 18, 24, 0.50)",
      },
      dropShadow: {
        "3xl": "0px 0px 10px rgba(0, 133, 234, 0.3)",
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
    require("@tailwindcss/line-clamp"),
  ],
};
