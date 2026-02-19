import type { Meta, StoryObj } from '@storybook/angular';
import { UseCasesSectionComponent } from './use-cases-section.component';

const meta: Meta<UseCasesSectionComponent> = {
  title: 'Landing/UseCasesSection',
  component: UseCasesSectionComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<UseCasesSectionComponent>;

export const Default: Story = {};

export const Narrow: Story = {
  render: () => ({
    template: `
      <div style="max-width: 600px; margin: 0 auto;">
        <app-use-cases-section />
      </div>
    `,
  }),
};

export const Wide: Story = {
  render: () => ({
    template: `
      <div style="max-width: 1400px; margin: 0 auto;">
        <app-use-cases-section />
      </div>
    `,
  }),
};
