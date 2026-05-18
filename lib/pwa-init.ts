/**
 * PWA Initialization
 * Registers service worker and enables offline support
 */

export async function initPWA() {
  if (typeof window === 'undefined') return;

  // Only register service worker in production or on web
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/',
      });
      console.log('Service Worker registered:', registration);

      // Check for updates periodically
      setInterval(() => {
        registration.update();
      }, 60000); // Check every minute
    } catch (error) {
      console.warn('Service Worker registration failed:', error);
    }
  }

  // Detect online/offline status
  window.addEventListener('online', () => {
    console.log('App is online');
  });

  window.addEventListener('offline', () => {
    console.log('App is offline - using cached data');
  });
}

export function isOnline(): boolean {
  if (typeof navigator === 'undefined') return true;
  return navigator.onLine;
}

export function installPWA() {
  if (typeof window === 'undefined') return;

  let deferredPrompt: any;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('Install prompt available');
  });

  window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    deferredPrompt = null;
  });

  return {
    canInstall: () => deferredPrompt !== null,
    install: async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response: ${outcome}`);
        deferredPrompt = null;
      }
    },
  };
}
