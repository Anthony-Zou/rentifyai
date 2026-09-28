import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.borlo.app',
  appName: 'Borlo',
  webDir: 'public',
  server: {
    url: 'https://borlo.app',
    cleartext: false,
  },
  ios: {
    contentInset: 'always',
  },
};

export default config;
