const colors = require("tailwindcss/colors");
const { fontFamily } = require("tailwindcss/defaultTheme");
const typography = require("@tailwindcss/typography");

module.exports = {
  darkMode: "class",
  content: ["./hugo_stats.json"],
  plugins: [typography],
  theme: {
    extend: {
      maxWidth: {
        letter: "66.40625rem",
        a4: "64.609375rem",
      },
      fontFamily: {
        headline: ["Fira Sans", ...fontFamily.sans],
        body: ["Merriweather", ...fontFamily.sans],
        mono: ["Fira Code", ...fontFamily.mono],
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            "--tw-prose-quote-borders": theme("colors.accent.400"),
            "--tw-prose-invert-quote-borders": theme("colors.accent.400"),
            "--tw-prose-links": theme("colors.accent.400"),
            "--tw-prose-invert-links": theme("colors.accent.400"),
            a: {
              "&:hover": {
                color: theme("colors.accent.800"),
              },
            },
          },
        },
      }),
      lineHeight: {
        snugish: "1.32",
        normal: "1.34",
      },
      height: {
        letter: "85.9375rem",
        "letter-col": "71.625rem",
        "letter-col-full": "77.9375rem",
        a4: "91.350883rem",
        "a4-col": "77.038383rem",
        "a4-col-full": "83.350883rem",
      },
      borderColor: (theme) => ({
        ...theme("colors"),
      }),
      colors: {
        black: colors.black,
        white: colors.white,
        gray: colors.gray,
        accent: colors.pink,
      },
      animation: {
        blink: "blink 1s linear infinite",
      },
      keyframes: (theme) => ({
        blink: {
          "0%, 100%": { opacity: 0 },
          "50%": { opacity: 1 },
        },
        bounce: {
          "0%, 100%": {
            transform: "translateY(-25%)",
            "animation-timing-function": "cubic-bezier(0.8, 0, 1, 1)",
          },
          "50%": {
            transform: "translateY(0)",
            "animation-timing-function": "cubic-bezier(0, 0, 0.2, 1)",
          },
        },
      }),
    },
  },
};
