/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ["./views/**/*.html"],
  theme: {
    colors: {
      "background": "#111313",
      "background-slightly-lighter": "#141616",
      "background-lighter": "#1c1f21",
      "background-more-lighter": "#202426",
      "background-bit-more-lighter": "#24292b",
      "background-lightest": "#272c2d",

      "label": "#747d80",
      "placeholder": "#5b6568",

      "available": "#6dc644",
      "reserved": "#3976d0",
      "occupied": "#c64444",

      "black-25": "rgba(17, 19, 19, 25%)",
    },

    extend: {
      gridTemplateColumns: {
        "auto-fill": "repeat(auto-fill, 100px)"
      },

      gridTemplateRows: {
        "auto-fill": "repeat(auto-fill, 100px)"
      },

      backgroundImage: {
        "hotel": "url('/assets/images/hotel-bg.png')",
      },

      height: {
        "9/10": "90vh",
        "full-4": "calc(100vh - 4rem)",
        "26": "6.5rem",
        "85": "21.5rem",
      },
    }
  },
}
