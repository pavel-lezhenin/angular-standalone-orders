import type { Meta, StoryObj } from '@storybook/angular';
import { Component, input } from '@angular/core';
import { TwoColumnLayoutComponent } from './two-column-layout.component';

@Component({
  selector: 'app-story-panel',
  standalone: true,
  template: `
    <div
      [style.background]="bg()"
      [style.padding]="'var(--spacing-xl)'"
      [style.borderRadius]="'var(--border-radius-md)'"
    >
      <strong>{{ label() }}</strong>
      <p
        style="margin: var(--spacing-xs) 0 0; font-size: var(--font-size-sm); color: var(--text-secondary);"
      >
        {{ description() }}
      </p>
    </div>
  `,
})
class StoryPanelComponent {
  readonly label = input('Panel');
  readonly description = input('');
  readonly bg = input('var(--surface-primary)');
}

const meta: Meta<TwoColumnLayoutComponent> = {
  title: 'Shared/UI/TwoColumnLayout',
  component: TwoColumnLayoutComponent,
  tags: ['autodocs'],
  argTypes: {
    sidebarWidth: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<TwoColumnLayoutComponent>;

/**
 * Default layout — cart sidebar width.
 * Main column takes all available space; sidebar is fixed-width.
 */
export const Default: Story = {
  args: {
    sidebarWidth: 'var(--cart-sidebar-width)',
  },
  render: (args) => ({
    props: args,
    imports: [TwoColumnLayoutComponent, StoryPanelComponent],
    template: `
      <app-two-column-layout [sidebarWidth]="sidebarWidth">
        <app-story-panel
          main
          label="Main content"
          description="Primary column — grows to fill all available space. Contains the main page content, tables, forms, etc."
          bg="var(--surface-secondary)"
        />
        <app-story-panel
          aside
          label="Sidebar"
          description="Fixed-width aside column. Preferred width driven by --sidebar-width CSS variable."
        />
      </app-two-column-layout>
    `,
  }),
};

/**
 * Checkout variant — wider sidebar.
 */
export const CheckoutWidth: Story = {
  args: {
    sidebarWidth: 'var(--checkout-sidebar-width)',
  },
  render: (args) => ({
    props: args,
    imports: [TwoColumnLayoutComponent, StoryPanelComponent],
    template: `
      <app-two-column-layout [sidebarWidth]="sidebarWidth">
        <app-story-panel
          main
          label="Delivery form"
          description="Main column with checkout delivery form."
          bg="var(--surface-secondary)"
        />
        <app-story-panel
          aside
          label="Order summary"
          description="Wider sidebar for checkout order summary (--checkout-sidebar-width)."
        />
      </app-two-column-layout>
    `,
  }),
};

/**
 * Rich content — demonstrates that main column clips/scrolls and sidebar stays intact.
 */
export const RichContent: Story = {
  args: {
    sidebarWidth: 'var(--cart-sidebar-width)',
  },
  render: (args) => ({
    props: args,
    imports: [TwoColumnLayoutComponent, StoryPanelComponent],
    template: `
      <app-two-column-layout [sidebarWidth]="sidebarWidth">
        <div main style="background: var(--surface-secondary); border-radius: var(--border-radius-md); padding: var(--spacing-xl);">
          <p style="margin: 0 0 var(--spacing-md);">Row 1 — The quick brown fox jumps over the lazy dog</p>
          <p style="margin: 0 0 var(--spacing-md);">Row 2 — The quick brown fox jumps over the lazy dog</p>
          <p style="margin: 0;">Row 3 — The quick brown fox jumps over the lazy dog</p>
        </div>
        <div aside style="background: var(--surface-primary); border: var(--spacing-1px) solid var(--color-border); border-radius: var(--border-radius-md); padding: var(--spacing-xl);">
          <p style="margin: 0 0 var(--spacing-sm); font-weight: var(--font-weight-semibold);">Order Summary</p>
          <p style="margin: 0; color: var(--text-secondary); font-size: var(--font-size-sm);">Subtotal: $100.00</p>
        </div>
      </app-two-column-layout>
    `,
  }),
};
