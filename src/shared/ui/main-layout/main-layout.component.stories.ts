import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig, moduleMetadata } from '@storybook/angular';
import { provideRouter } from '@angular/router';
import { Component } from '@angular/core';
import { MainLayoutComponent } from './main-layout.component';
import { LayoutService } from '@/shared/services/layout.service';
import type { NavItem } from '@/shared/models';
import { signal } from '@angular/core';

@Component({
  selector: 'app-mock-page',
  standalone: true,
  template: `
    <div style="padding: 2rem;">
      <h1>Page Content</h1>
      <p>This is where the page content would appear via router-outlet.</p>
      <p>The main layout provides the top bar and container structure.</p>
    </div>
  `,
})
class MockPageComponent {}

const createMockLayoutService = (title: string, navItems: NavItem[]) => ({
  title: signal(title),
  navItems: signal(navItems),
  setTitle: (newTitle: string) => {},
  setNavItems: (items: NavItem[]) => {},
  reset: () => {},
});

const meta: Meta<MainLayoutComponent> = {
  title: 'Shared/UI/MainLayout',
  component: MainLayoutComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<MainLayoutComponent>;

export const Default: Story = {
  decorators: [
    moduleMetadata({
      imports: [MockPageComponent],
    }),
    applicationConfig({
      providers: [
        provideRouter([{ path: '', component: MockPageComponent }]),
        {
          provide: LayoutService,
          useValue: createMockLayoutService('Orders Platform', []),
        },
      ],
    }),
  ],
};

export const WithNavigation: Story = {
  decorators: [
    moduleMetadata({
      imports: [MockPageComponent],
    }),
    applicationConfig({
      providers: [
        provideRouter([{ path: '', component: MockPageComponent }]),
        {
          provide: LayoutService,
          useValue: createMockLayoutService('Landing Page', [
            { label: 'Features', route: '#features' },
            { label: 'Pricing', route: '#pricing' },
            { label: 'Contact', route: '#contact' },
          ]),
        },
      ],
    }),
  ],
};

export const CustomTitle: Story = {
  decorators: [
    moduleMetadata({
      imports: [MockPageComponent],
    }),
    applicationConfig({
      providers: [
        provideRouter([{ path: '', component: MockPageComponent }]),
        {
          provide: LayoutService,
          useValue: createMockLayoutService('My Custom App', []),
        },
      ],
    }),
  ],
};

export const EcommerceLayout: Story = {
  decorators: [
    moduleMetadata({
      imports: [MockPageComponent],
    }),
    applicationConfig({
      providers: [
        provideRouter([{ path: '', component: MockPageComponent }]),
        {
          provide: LayoutService,
          useValue: createMockLayoutService('Shop', [
            { label: 'New Arrivals', route: '/shop/new' },
            { label: 'Sale', route: '/shop/sale' },
            { label: 'Categories', route: '/shop/categories' },
          ]),
        },
      ],
    }),
  ],
};
