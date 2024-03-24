/** @type {import("tailwindcss").Config} */
// eslint-disable-next-line no-undef
module.exports = {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primaryBg: "#EAEAEA",
        secondaryBg: "#F2F2F2",
        tertiaryBg: "#F9F9F9",
        quaternaryBg: "#FAFAFA",
      },
    },
  },
  corePlugins: {
    preflight: false,
  },
  plugins: [],
}
