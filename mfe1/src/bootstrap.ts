import { bootstrapApplication } from '@angular/platform-browser';
import type { ApplicationRef } from '@angular/core';
import { appConfig } from './app/app.config';
import { App } from './app/app';

/**
 * Mount function for the vanilla shell to dynamically load this Angular MFE
 * @param container - CSS selector string or HTMLElement where the app should be mounted
 * @returns Promise that resolves to an object with an unmount function
 */
export async function mount(container: string | HTMLElement): Promise<{ unmount: () => void }> {
  // Get the container element
  const containerElement = typeof container === 'string' 
    ? document.querySelector(container) 
    : container;

  if (!containerElement) {
    throw new Error(`Container not found: ${container}`);
  }

  // Create a root element for the Angular app
  const appRoot = document.createElement('app-root');
  containerElement.appendChild(appRoot);

  // Bootstrap the Angular application
  const appRef: ApplicationRef = await bootstrapApplication(App, appConfig);

  // Return unmount function
  return {
    unmount: () => {
      appRef.destroy();
      if (containerElement.contains(appRoot)) {
        containerElement.removeChild(appRoot);
      }
    }
  };
}

// Auto-bootstrap when loaded directly (not via Module Federation)
// Check if we're being loaded as a standalone app
const isStandalone = typeof window !== 'undefined' && !(window as any).__MFE_LOADED__;
if (isStandalone) {
  bootstrapApplication(App, appConfig)
    .catch((err) => console.error(err));
}
