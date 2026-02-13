/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#FDF6F0",
          light: "#FEF9F5",
        },
        secondary: {
          DEFAULT: "#F28C38",
          dark: "#D7762B",
        },
        accent: {
          DEFAULT: "#405A38",
          light: "#556B49",
        },
        error: {
          DEFAULT: "#E53E3E",
          light: "#F56565",
        },
      },
    },
  },
  plugins: [],
};
