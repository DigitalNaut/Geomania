import path from 'path';
import postcss from 'postcss';

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
        postcssLoaderOptions: {
          // When using postCSS 8
          implementation: postcss,
        },
      },
    },
  ],
  framework: '@storybook/react',
  core: {
    builder: 'webpack5',
  },
  // Fix absolute imports in stories
  webpackFinal: async (config: any) => {
    config.resolve.modules.push(path.resolve(__dirname, '..'));
    return config;
  },
};
