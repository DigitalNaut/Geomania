/* eslint-disable @typescript-eslint/no-var-requires */
// @preval
const resolveConfig = require('tailwindcss/resolveConfig'); // eslint-disable-line import/no-extraneous-dependencies

const tailwindConfig = require('../../tailwind.config');

module.exports = resolveConfig(tailwindConfig);
/* eslint-enable @typescript-eslint/no-var-requires */
