/**
 * Client-side router using the History API
 * Handles route registration, navigation, and browser back/forward events
 */

class Router {
  constructor() {
    this.routes = new Map();
    this.currentRoute = null;
    this.isInitialized = false;
  }

  /**
   * Register a route with its handler function
   * @param {string} path - The route path (e.g., '/', '/home', '/mfe1')
   * @param {Function} handler - The function to call when this route is active
   */
  register(path, handler) {
    if (typeof handler !== 'function') {
      throw new Error(`Handler for route "${path}" must be a function`);
    }
    this.routes.set(path, handler);
  }

  /**
   * Navigate to a specific path using the History API
   * @param {string} path - The path to navigate to
   * @param {boolean} skipPushState - If true, don't add to history (used for popstate)
   */
  async navigate(path, skipPushState = false) {
    try {
      // Check if route exists, fallback to home if not
      if (!this.routes.has(path)) {
        console.warn(`Route "${path}" not found, redirecting to home`);
        path = '/';
      }

      // Update browser history if not coming from popstate
      if (!skipPushState) {
        window.history.pushState({ path }, '', path);
      }

      // Store current route
      this.currentRoute = path;

      // Get and execute the route handler
      const handler = this.routes.get(path);
      try {
        await handler(path);
      } catch (error) {
        console.error(`Error executing handler for route "${path}":`, error);
        
        // If we're not already on home and the error occurred, try to navigate home
        // This ensures the shell remains stable even if a route handler fails
        if (path !== '/' && path !== '/home') {
          console.log('Attempting to recover by navigating to home');
          this.navigate('/');
        } else {
          // If home page itself fails, we have a critical error
          // Re-throw to be caught by global error handler
          throw error;
        }
      }
    } catch (error) {
      console.error('Critical navigation error:', error);
      // Ensure shell remains functional by not crashing
      // The error will be caught by global error handler
    }
  }

  /**
   * Initialize the router
   * Sets up popstate listener and handles initial route
   */
  init() {
    if (this.isInitialized) {
      console.warn('Router already initialized');
      return;
    }

    // Set up popstate listener for back/forward navigation
    window.addEventListener('popstate', (event) => {
      const path = event.state?.path || window.location.pathname;
      // Use skipPushState=true to avoid adding duplicate history entries
      this.navigate(path, true);
    });

    // Handle initial route on page load
    const initialPath = window.location.pathname;
    this.navigate(initialPath, true);

    this.isInitialized = true;
  }

  /**
   * Get the current active route
   * @returns {string|null} The current route path
   */
  getCurrentRoute() {
    return this.currentRoute;
  }

  /**
   * Check if a route is registered
   * @param {string} path - The path to check
   * @returns {boolean} True if the route exists
   */
  hasRoute(path) {
    return this.routes.has(path);
  }
}

// Export a singleton instance
export const router = new Router();
export default router;
