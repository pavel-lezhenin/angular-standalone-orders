import type { StorybookConfig } from '@storybook/angular';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(ts)'],
  addons: ['@storybook/addon-a11y'],
  framework: {
    name: '@storybook/angular',
    options: {},
  },
  staticDirs: ['../public'],
};

export default config;