import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { provideRouter } from '@angular/router';
import { FooterComponent } from './footer.component';

const meta: Meta<FooterComponent> = {
  title: 'Shared/UI/Footer',
  component: FooterComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [provideRouter([])],
    }),
  ],
};

export default meta;
type Story = StoryObj<FooterComponent>;

export const Default: Story = {};
