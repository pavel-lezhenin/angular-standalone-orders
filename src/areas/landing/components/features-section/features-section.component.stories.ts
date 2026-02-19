import type { Meta, StoryObj } from '@storybook/angular';
import { FeaturesSectionComponent } from './features-section.component';

const meta: Meta<FeaturesSectionComponent> = {
  title: 'Landing/FeaturesSection',
  component: FeaturesSectionComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<FeaturesSectionComponent>;

export const Default: Story = {};

export const Narrow: Story = {
  render: () => ({
    template: `
      <div style="max-width: 600px; margin: 0 auto;">
        <app-features-section />
      </div>
    `,
  }),
};

export const Wide: Story = {
  render: () => ({
    template: `
      <div style="max-width: 1400px; margin: 0 auto;">
        <app-features-section />
      </div>
    `,
  }),
};
