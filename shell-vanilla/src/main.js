/**
 * Main application entry point
 * Initializes the router, navigation, and sets up route handlers
 */

import router from './router.js';
import { createNavigation, updateActiveLink } from './navigation.js';
import mfeLoader from './mfe-loader.js';
import { setupGlobalErrorHandler, withErrorBoundary, createGenericFallback } from './error-boundary.js';

/**
 * Render the home page
 */
function renderHome() {
  console.log('Rendering home page');
  
  const content = document.getElementById('content');
  const mfeContainer = document.getElementById('mfe-container');
  
  // Clear any loaded MFE
  if (mfeLoader.getCurrentMFE()) {
    mfeLoader.unloadMFE(mfeLoader.getCurrentMFE());
  }
  
  // Clear MFE container
  if (mfeContainer) {
    mfeContainer.innerHTML = '';
  }
  
  // Create home page content
  const homeContent = document.createElement('div');
  homeContent.className = 'home-page';
  homeContent.innerHTML = `
    <div class="home-hero">
      <h1>Welcome to Vanilla Shell</h1>
      <p class="home-subtitle">A lightweight, framework-agnostic microfrontend host</p>
    </div>
    
    <div class="home-content">
      <section class="feature-section">
        <h2>About This Application</h2>
        <p>
          This is a vanilla JavaScript shell application that demonstrates how to 
          dynamically load Angular microfrontends using Module Federation, without 
          requiring the shell itself to be built with Angular.
        </p>
      </section>
      
      <section class="feature-section">
        <h2>Features</h2>
        <ul class="feature-list">
          <li>✨ Zero framework dependencies in the shell</li>
          <li>🚀 Fast builds with Vite</li>
          <li>🔌 Dynamic microfrontend loading via Module Federation</li>
          <li>🧭 Client-side routing with History API</li>
          <li>♻️ Proper lifecycle management for loaded modules</li>
        </ul>
      </section>
      
      <section class="feature-section">
        <h2>Get Started</h2>
        <p>
          Click on <strong>MFE1 Dashboard</strong> in the navigation to load the 
          Angular microfrontend dynamically.
        </p>
      </section>
    </div>
  `;
  
  // Replace content
  if (content) {
    // Keep navigation, replace everything else
    const existingNav = content.querySelector('nav');
    content.innerHTML = '';
    if (existingNav) {
      content.appendChild(existingNav);
    }
    content.appendChild(homeContent);
  }
  
  // Update active navigation link
  updateActiveLink('/');
}

/**
 * Load and render MFE1
 */
async function renderMFE1() {
  console.log('Loading MFE1');
  
  const content = document.getElementById('content');
  const mfeContainer = document.getElementById('mfe-container');
  
  // Clear home content if present
  const homeContent = content?.querySelector('.home-page');
  if (homeContent) {
    homeContent.remove();
  }
  
  // Ensure MFE container exists
  if (!mfeContainer) {
    const newContainer = document.createElement('div');
    newContainer.id = 'mfe-container';
    content?.appendChild(newContainer);
  }
  
  try {
    // Clear the container - the mfeLoader will handle loading states
    const container = document.getElementById('mfe-container');
    if (container) {
      container.innerHTML = '';
    }
    
    // Load the MFE - this will handle its own loading state
    // Error handling is done inside mfeLoader.loadMFE, which will display the error boundary
    await mfeLoader.loadMFE('mfe1', '#mfe-container');
    
    // Update active navigation link
    updateActiveLink('/mfe1');
    
    console.log('MFE1 loaded and mounted successfully');
    
  } catch (error) {
    console.error('Failed to load MFE1:', error);
    // Error boundary is already displayed by mfeLoader._displayError
    // Just ensure navigation is updated
    updateActiveLink('/mfe1');
  }
}

/**
 * Initialize the application
 */
function initApp() {
  console.log('Initializing Vanilla Shell application');
  
  try {
    // Set up global error handler to catch unhandled errors
    setupGlobalErrorHandler();
    
    // Make router globally accessible for error boundary
    window.router = router;
    
    // Create and mount navigation
    const navPlaceholder = document.getElementById('navigation');
    if (navPlaceholder) {
      const nav = createNavigation();
      navPlaceholder.replaceWith(nav);
    }
    
    // Wrap route handlers with error boundaries
    const safeRenderHome = withErrorBoundary(renderHome, {
      context: 'Home Page',
      fallbackContainer: document.getElementById('content')
    });
    
    const safeRenderMFE1 = withErrorBoundary(renderMFE1, {
      context: 'MFE1 Loading',
      fallbackContainer: document.getElementById('mfe-container')
    });
    
    // Register routes with error-wrapped handlers
    router.register('/', safeRenderHome);
    router.register('/home', safeRenderHome);
    router.register('/mfe1', safeRenderMFE1);
    
    // Initialize router (this will handle the initial route)
    router.init();
    
    console.log('Application initialized successfully');
  } catch (error) {
    console.error('Failed to initialize application:', error);
    
    // Display critical error
    const content = document.getElementById('content');
    if (content) {
      const criticalError = createGenericFallback(error, 'Application Initialization');
      content.innerHTML = '';
      content.appendChild(criticalError);
    }
  }
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// Export for testing purposes
export { renderHome, renderMFE1, initApp };
