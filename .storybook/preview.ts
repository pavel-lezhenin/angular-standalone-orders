import type { Preview } from '@storybook/angular';

type ThemeMode = 'system' | 'light' | 'dark';
type DeviceMode = 'desktop' | 'tablet' | 'mobile';

const DEVICE_WIDTHS: Record<DeviceMode, string> = {
  desktop: '1280px',
  tablet: '960px',
  mobile: '375px',
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
  html.classList.add(device);

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
          { value: 'desktop', title: 'Desktop' },
          { value: 'tablet', title: 'Tablet' },
          { value: 'mobile', title: 'Mobile' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (story, context) => {
      applyTheme(context.globals['theme'] as ThemeMode);
      applyDevice(context.globals['device'] as DeviceMode);
      return story();
    },
  ],
};

export default preview;