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
    CapacitorHttp: {
      enabled: true,
    },
  },
  server: {
    hostname: 'memorial-gallery.meshackdapaz.com',
    androidScheme: 'https',
    iosScheme: 'capacitor',
    allowNavigation: [
      'https://wyhqxaicpxhdltezfmay.supabase.co',
      'https://*.supabase.co'
    ]
  }
};

export default config;
