import type { Meta, StoryObj } from '@storybook/angular';
import { HeroSectionComponent } from './hero-section.component';

const meta: Meta<HeroSectionComponent> = {
  title: 'Landing/HeroSection',
  component: HeroSectionComponent,
  tags: ['autodocs'],
  argTypes: {
    ctaClick: { action: 'ctaClick' },
  },
};

export default meta;
type Story = StoryObj<HeroSectionComponent>;

export const Default: Story = {};

export const Narrow: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="max-width: 600px; margin: 0 auto;">
        <app-hero-section (ctaClick)="ctaClick($event)" />
      </div>
    `,
  }),
};

export const Wide: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="max-width: 1400px; margin: 0 auto;">
        <app-hero-section (ctaClick)="ctaClick($event)" />
      </div>
    `,
  }),
};
