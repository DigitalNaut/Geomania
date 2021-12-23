// import postcss from 'postcss';
import * as tailwindcss from '../tailwind.config';

//import type { StorybookConfig } from '@storybook/react/types';

export default {
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/preset-create-react-app',
    {
      // https://stackoverflow.com/questions/65495912/storybook-tailwind-how-should-i-add-tailwind-to-storybook
      name: '@storybook/addon-postcss',
      options: {
        cssLoaderOptions: {
          // When you have split your css over multiple files
          // and use @import('./other-styles.css')
          importLoaders: 1,
        },
        postcssLoaderOptions: {
          // When using postCSS 8
          implementation: require('postcss'),
          postcssOptions: {
            plugins: {
              tailwindcss, // You can nest your options entirely here
              autoprefixer: {
                // autoprefixer options
              },
            },
          },
        },
      },
    },
  ],
  framework: '@storybook/react',
  core: {
    builder: 'webpack5',
  },
  // features: {
  //   postcss: false,
  // },
};
