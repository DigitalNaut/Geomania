/* cspell:disable */
module.exports = {
  style: {
    postcss: {
      plugins: [require("tailwindcss"), require("autoprefixer")],
    },
  },
  babel: {
    plugins: ["@babel/plugin-proposal-nullish-coalescing-operator"],
  },
};
