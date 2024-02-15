const colors = require("tailwindcss/colors");
const { fontFamily } = require("tailwindcss/defaultTheme");
const typography = require("@tailwindcss/typography");

module.exports = {
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
        invert: {
          css: {
            code: {
              backgroundColor: theme("colors.gray.800"),
            },
          },
        },
        DEFAULT: {
          css: {
            "--tw-prose-quote-borders": theme("colors.accent.400"),
            "--tw-prose-invert-quote-borders": theme("colors.accent.400"),
            "--tw-prose-links": theme("colors.accent.600"),
            "--tw-prose-invert-links": theme("colors.accent.400"),
            "h2,h3,h4,h5,h6": {
              a: {
                color: "var(--tw-prose-links)",
                textDecoration: "none",
                "&:hover": {
                  color: theme("colors.accent.800"),
                },
              },
            },
            a: {
              color: "var(--tw-prose-body)",
              textDecorationColor: theme("colors.accent.400"),
              textDecorationThickness: "2px",
              textUnderlineOffset: "2px",
              "&:hover": {
                color: "var(--tw-prose-links)",
              },
            },
            code: {
              backgroundColor: theme("colors.gray.200"),
              borderRadius: theme("borderRadius.md"),
              paddingInline: theme("spacing.1"),
            },
            "code::before": {
              content: "normal",
            },
            "code::after": {
              content: "normal",
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
        accent: colors.green,
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
