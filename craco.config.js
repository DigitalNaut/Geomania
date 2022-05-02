/* cspell:disable */
module.exports = {
  style: {
    postcss: {
      plugins: [
        require("tailwindcss"),
        require("autoprefixer")
      ],
    },
  },
  babel: {
    plugins: [
      "@babel/plugin-proposal-nullish-coalescing-operator",
      // https://marabesi.com/web/2021/10/31/sharing-tailwind-config-elsewhere-for-variable-access.html
      "preval",
    ],
  },
};
