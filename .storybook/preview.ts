import type { Preview } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';

type ThemeMode = 'system' | 'light' | 'dark';
type DeviceMode = 'desktop' | 'tablet-max' | 'tablet-min' | 'mobile-max' | 'mobile-min';

/**
 * Container widths for Storybook device preview
 * Testing boundary values (edge cases) for each breakpoint:
 * mobile (0-600), tablet (601-960), desktop (961+)
 */
const DEVICE_WIDTHS: Record<DeviceMode, string> = {
  desktop: '1280px',      // Desktop comfortable width
  'tablet-max': '960px',  // Tablet upper boundary (max-width: 960px)
  'tablet-min': '601px',  // Tablet lower boundary (min-width: 601px)
  'mobile-max': '600px',  // Mobile upper boundary (max-width: 600px)
  'mobile-min': '320px',  // Mobile lower boundary (smallest phones)
};

const applyTheme = (theme: ThemeMode): void => {
  const html = document.documentElement;
  html.classList.remove('theme-light', 'theme-dark');

  if (theme === 'light') {
    html.classList.add('theme-light');
  }

  if (theme === 'dark') {
    html.classList.add('theme-dark');
  }
};

const applyDevice = (device: DeviceMode): void => {
  const html = document.documentElement;
  html.classList.remove('desktop', 'tablet', 'mobile');
  
  // Map device variants to base classes
  if (device === 'desktop') {
    html.classList.add('desktop');
  } else if (device.startsWith('tablet')) {
    html.classList.add('tablet');
  } else if (device.startsWith('mobile')) {
    html.classList.add('mobile');
  }

  const root = document.getElementById('storybook-root');
  if (!root) {
    return;
  }

  root.style.width = '100%';
  root.style.maxWidth = DEVICE_WIDTHS[device];
  root.style.margin = '0 auto';
};

const preview: Preview = {
  parameters: {
    layout: 'padded',
  },
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Application theme mode',
      defaultValue: 'system',
      toolbar: {
        icon: 'mirror',
        items: [
          { value: 'system', title: 'System' },
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
    device: {
      name: 'Device',
      description: 'Responsive breakpoint class',
      defaultValue: 'desktop',
      toolbar: {
        icon: 'mobile',
        items: [
          { value: 'desktop', title: 'Desktop (1280px)' },
          { value: 'tablet-max', title: 'Tablet Max (960px)' },
          { value: 'tablet-min', title: 'Tablet Min (601px)' },
          { value: 'mobile-max', title: 'Mobile Max (600px)' },
          { value: 'mobile-min', title: 'Mobile Min (320px)' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    applicationConfig({
      providers: [
        provideAnimations(),
        {
          provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
          useValue: { appearance: 'outline' },
        },
      ],
    }),
    (story, context) => {
      applyTheme(context.globals['theme'] as ThemeMode);
      applyDevice(context.globals['device'] as DeviceMode);
      return story();
    },
  ],
};

export default preview;