import type { Meta, StoryObj } from '@storybook/angular';
import { FaqSectionComponent } from './faq-section.component';

const meta: Meta<FaqSectionComponent> = {
  title: 'Landing/FaqSection',
  component: FaqSectionComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<FaqSectionComponent>;

export const Default: Story = {};

export const Narrow: Story = {
  render: () => ({
    template: `
      <div style="max-width: 600px; margin: 0 auto;">
        <app-faq-section />
      </div>
    `,
  }),
};

export const Wide: Story = {
  render: () => ({
    template: `
      <div style="max-width: 1200px; margin: 0 auto;">
        <app-faq-section />
      </div>
    `,
  }),
};
