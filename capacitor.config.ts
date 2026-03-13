import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.meshackdapaz.gallery',
  appName: 'Memorial Gallery',
  webDir: 'out',
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: true,
      backgroundColor: "#000000",
      showSpinner: false,
    },
  },
  server: {
    hostname: 'memorial-gallery.meshackdapaz.com',
    androidScheme: 'https',
    iosScheme: 'https',
    allowNavigation: [
      'wyhqxaicpxhdltezfmay.supabase.co'
    ]
  }
};

export default config;
