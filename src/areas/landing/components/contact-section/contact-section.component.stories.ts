import type { Meta, StoryObj } from '@storybook/angular';
import { ContactSectionComponent } from './contact-section.component';

const meta: Meta<ContactSectionComponent> = {
  title: 'Landing/ContactSection',
  component: ContactSectionComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<ContactSectionComponent>;

export const Default: Story = {};

export const Narrow: Story = {
  render: () => ({
    template: `
      <div style="max-width: 600px; margin: 0 auto;">
        <app-contact-section />
      </div>
    `,
  }),
};

export const Wide: Story = {
  render: () => ({
    template: `
      <div style="max-width: 1200px; margin: 0 auto;">
        <app-contact-section />
      </div>
    `,
  }),
};
