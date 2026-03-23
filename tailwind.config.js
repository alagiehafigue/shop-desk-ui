/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef6ff",
          100: "#d8eaff",
          500: "#2563eb",
          600: "#1d4ed8",
          700: "#1e40af",
          900: "#14213d",
        },
        ink: "#243042",
        mist: "#f4f7fb",
      },
      boxShadow: {
        panel: "0 24px 60px -28px rgba(15, 23, 42, 0.35)",
      },
      fontFamily: {
        sans: ["Manrope", "Segoe UI", "sans-serif"],
      },
      backgroundImage: {
        "login-glow":
          "radial-gradient(circle at top left, rgba(37, 99, 235, 0.18), transparent 35%), radial-gradient(circle at right, rgba(15, 23, 42, 0.12), transparent 25%)",
      },
    },
  },
  plugins: [],
};
