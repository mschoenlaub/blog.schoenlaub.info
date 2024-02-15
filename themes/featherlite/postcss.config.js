let tailwindConfig = process.env.HUGO_FILE_TAILWIND_CONFIG_JS || "./tailwind.config.js";
const tailwind = require("tailwindcss")(tailwindConfig);
const autoprefixer = require("autoprefixer");
const darkThemeClass = require("postcss-dark-theme-class")({
  darkSelector: ".dark",
  lightSelector: ".light",
});

module.exports = {
  plugins: [darkThemeClass, tailwind, autoprefixer],
};
