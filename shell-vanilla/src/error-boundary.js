/**
 * Error Boundary Component
 * Provides user-friendly error display and fallback UI
 * Ensures shell remains stable when errors occur
 */

/**
 * Create an error display component
 * @param {Object} options - Error display options
 * @param {string} options.title - Error title
 * @param {string} options.message - Error message
 * @param {Error} options.error - The error object
 * @param {string} options.context - Context where error occurred (e.g., 'MFE Loading', 'Navigation')
 * @param {Function} options.onRetry - Optional retry callback
 * @param {Function} options.onGoHome - Optional go home callback
 * @returns {HTMLElement} The error display element
 */
export function createErrorDisplay(options = {}) {
  const {
    title = 'Something Went Wrong',
    message = 'An unexpected error occurred.',
    error = null,
    context = 'Application',
    onRetry = null,
    onGoHome = null
  } = options;

  const errorContainer = document.createElement('div');
  errorContainer.className = 'error-boundary';
  errorContainer.setAttribute('role', 'alert');
  errorContainer.setAttribute('aria-live', 'assertive');

  // Create error icon
  const icon = document.createElement('div');
  icon.className = 'error-icon';
  icon.innerHTML = '⚠️';

  // Create error title
  const titleElement = document.createElement('h2');
  titleElement.className = 'error-title';
  titleElement.textContent = title;

  // Create error message
  const messageElement = document.createElement('p');
  messageElement.className = 'error-description';
  messageElement.textContent = message;

  // Create error details (if error object provided)
  let detailsElement = null;
  if (error) {
    detailsElement = document.createElement('details');
    detailsElement.className = 'error-details';
    
    const summary = document.createElement('summary');
    summary.textContent = 'Technical Details';
    
    const detailsContent = document.createElement('div');
    detailsContent.className = 'error-details-content';
    
    const errorMessage = document.createElement('p');
    errorMessage.className = 'error-message';
    errorMessage.textContent = error.message || 'Unknown error';
    
    const errorContext = document.createElement('p');
    errorContext.className = 'error-context';
    errorContext.textContent = `Context: ${context}`;
    
    if (error.stack) {
      const stackTrace = document.createElement('pre');
      stackTrace.className = 'error-stack';
      stackTrace.textContent = error.stack;
      detailsContent.appendChild(errorMessage);
      detailsContent.appendChild(errorContext);
      detailsContent.appendChild(stackTrace);
    } else {
      detailsContent.appendChild(errorMessage);
      detailsContent.appendChild(errorContext);
    }
    
    detailsElement.appendChild(summary);
    detailsElement.appendChild(detailsContent);
  }

  // Create action buttons
  const actionsContainer = document.createElement('div');
  actionsContainer.className = 'error-actions';

  if (onRetry) {
    const retryButton = document.createElement('button');
    retryButton.className = 'error-button error-button-primary';
    retryButton.textContent = 'Try Again';
    retryButton.onclick = () => {
      try {
        onRetry();
      } catch (retryError) {
        console.error('Error during retry:', retryError);
      }
    };
    actionsContainer.appendChild(retryButton);
  }

  if (onGoHome) {
    const homeButton = document.createElement('button');
    homeButton.className = 'error-button error-button-secondary';
    homeButton.textContent = 'Go to Home';
    homeButton.onclick = () => {
      try {
        onGoHome();
      } catch (homeError) {
        console.error('Error navigating home:', homeError);
      }
    };
    actionsContainer.appendChild(homeButton);
  }

  // Assemble the error display
  errorContainer.appendChild(icon);
  errorContainer.appendChild(titleElement);
  errorContainer.appendChild(messageElement);
  if (detailsElement) {
    errorContainer.appendChild(detailsElement);
  }
  if (actionsContainer.children.length > 0) {
    errorContainer.appendChild(actionsContainer);
  }

  return errorContainer;
}

/**
 * Create a fallback UI for MFE loading failures
 * @param {string} mfeName - The name of the MFE that failed to load
 * @param {Error} error - The error object
 * @param {Function} onRetry - Retry callback
 * @param {Function} onGoHome - Go home callback
 * @returns {HTMLElement} The fallback UI element
 */
export function createMFEFallback(mfeName, error, onRetry, onGoHome) {
  return createErrorDisplay({
    title: `Unable to Load ${mfeName}`,
    message: `The microfrontend "${mfeName}" could not be loaded. This might be because the service is not running or there's a network issue.`,
    error,
    context: 'MFE Loading',
    onRetry,
    onGoHome
  });
}

/**
 * Create a generic error fallback
 * @param {Error} error - The error object
 * @param {string} context - Context where error occurred
 * @returns {HTMLElement} The fallback UI element
 */
export function createGenericFallback(error, context = 'Application') {
  return createErrorDisplay({
    title: 'Unexpected Error',
    message: 'An unexpected error occurred. The application should still be functional.',
    error,
    context,
    onGoHome: () => {
      window.location.href = '/';
    }
  });
}

/**
 * Wrap a function with error boundary
 * @param {Function} fn - The function to wrap
 * @param {Object} options - Error handling options
 * @param {string} options.context - Context for error reporting
 * @param {Function} options.onError - Custom error handler
 * @param {HTMLElement} options.fallbackContainer - Container to show fallback UI
 * @returns {Function} The wrapped function
 */
export function withErrorBoundary(fn, options = {}) {
  const {
    context = 'Function',
    onError = null,
    fallbackContainer = null
  } = options;

  return async function(...args) {
    try {
      return await fn.apply(this, args);
    } catch (error) {
      console.error(`Error in ${context}:`, error);

      // Call custom error handler if provided
      if (onError) {
        try {
          onError(error);
        } catch (handlerError) {
          console.error('Error in error handler:', handlerError);
        }
      }

      // Show fallback UI if container provided
      if (fallbackContainer) {
        const fallback = createGenericFallback(error, context);
        fallbackContainer.innerHTML = '';
        fallbackContainer.appendChild(fallback);
      }

      // Re-throw to allow caller to handle if needed
      throw error;
    }
  };
}

/**
 * Global error handler setup
 * Catches unhandled errors and displays fallback UI
 */
export function setupGlobalErrorHandler() {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    // Prevent default browser error handling
    event.preventDefault();
    
    // Show error notification
    showErrorNotification(
      'An unexpected error occurred',
      event.reason?.message || 'Unknown error'
    );
  });

  // Handle global errors
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    
    // Don't prevent default for script loading errors
    if (event.filename) {
      showErrorNotification(
        'Script Error',
        `Failed to load: ${event.filename}`
      );
    }
  });
}

/**
 * Show a temporary error notification
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 */
export function showErrorNotification(title, message) {
  // Remove existing notifications
  const existing = document.querySelector('.error-notification');
  if (existing) {
    existing.remove();
  }

  const notification = document.createElement('div');
  notification.className = 'error-notification';
  notification.setAttribute('role', 'alert');
  
  const notificationTitle = document.createElement('strong');
  notificationTitle.textContent = title;
  
  const notificationMessage = document.createElement('span');
  notificationMessage.textContent = message;
  
  const closeButton = document.createElement('button');
  closeButton.className = 'error-notification-close';
  closeButton.textContent = '×';
  closeButton.setAttribute('aria-label', 'Close notification');
  closeButton.onclick = () => notification.remove();
  
  notification.appendChild(notificationTitle);
  notification.appendChild(notificationMessage);
  notification.appendChild(closeButton);
  
  document.body.appendChild(notification);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.classList.add('error-notification-fade-out');
      setTimeout(() => notification.remove(), 300);
    }
  }, 5000);
}

export default {
  createErrorDisplay,
  createMFEFallback,
  createGenericFallback,
  withErrorBoundary,
  setupGlobalErrorHandler,
  showErrorNotification
};
