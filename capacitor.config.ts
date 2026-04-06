import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.picvibez.app',
  appName: 'PicVibez',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
