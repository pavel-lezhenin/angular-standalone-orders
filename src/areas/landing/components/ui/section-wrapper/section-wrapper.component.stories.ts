import type { Meta, StoryObj } from '@storybook/angular';
import { SectionWrapperComponent } from './section-wrapper.component';

const meta: Meta<SectionWrapperComponent> = {
  title: 'Landing/UI/SectionWrapper',
  component: SectionWrapperComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<SectionWrapperComponent>;

export const Default: Story = {
  render: () => ({
    template: `
      <app-section-wrapper>
        <h2>Section Title</h2>
        <p>This is content inside the section wrapper. The wrapper provides consistent max-width and padding.</p>
      </app-section-wrapper>
    `,
  }),
};

export const WithList: Story = {
  render: () => ({
    template: `
      <app-section-wrapper>
        <h2>Features</h2>
        <ul>
          <li>Feature 1</li>
          <li>Feature 2</li>
          <li>Feature 3</li>
        </ul>
      </app-section-wrapper>
    `,
  }),
};

export const WithButton: Story = {
  render: () => ({
    template: `
      <app-section-wrapper>
        <h2>Call to Action</h2>
        <p>Ready to get started?</p>
        <button style="padding: 0.5rem 1rem; background: #1976d2; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Click Here
        </button>
      </app-section-wrapper>
    `,
  }),
};
