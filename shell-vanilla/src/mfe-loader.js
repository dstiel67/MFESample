/**
 * MFE Loader Module
 * Handles dynamic loading of microfrontends via Module Federation
 * Manages MFE lifecycle, container elements, and error handling
 */

import { createMFEFallback } from './error-boundary.js';

class MFELoader {
  constructor() {
    // Track loaded MFEs with their metadata
    this.loadedMFEs = new Map();
    // Track the currently active MFE
    this.currentMFE = null;
    // Track if federation is initialized
    this.federationInitialized = false;
  }

  /**
   * Load the federation manifest
   * @private
   */
  async _loadManifest() {
    try {
      const response = await fetch('/federation.manifest.json');
      if (!response.ok) {
        throw new Error(`Failed to fetch manifest: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error loading manifest:', error);
      // Return default manifest if file doesn't exist
      console.warn('Using default federation manifest');
      return {
        'mfe1': 'http://localhost:4201/remoteEntry.json'
      };
    }
  }

  /**
   * Load and mount a microfrontend
   * @param {string} name - The name of the MFE (must match remote config)
   * @param {string|HTMLElement} containerSelector - Container element or selector
   * @param {Object} options - Additional options for the MFE
   * @returns {Promise<Object>} Object containing unmount function and metadata
   */
  async loadMFE(name, containerSelector, options = {}) {
    try {
      console.log(`Loading MFE: ${name}`);

      // Get or create container element
      const container = this._getOrCreateContainer(containerSelector);
      
      if (!container) {
        throw new Error(`Container not found: ${containerSelector}`);
      }

      // Check if MFE is already loaded
      if (this.loadedMFEs.has(name)) {
        console.warn(`MFE "${name}" is already loaded. Unloading first.`);
        await this.unloadMFE(name);
      }

      // Import the remote module using Native Federation
      const remoteModule = await this._importRemoteModule(name);

      // Bootstrap the MFE
      const mfeInstance = await this._bootstrapMFE(remoteModule, container, options);

      // Store MFE metadata
      const mfeMetadata = {
        name,
        container,
        instance: mfeInstance,
        loadedAt: new Date(),
        options
      };

      this.loadedMFEs.set(name, mfeMetadata);
      this.currentMFE = name;

      console.log(`MFE "${name}" loaded successfully`);

      return {
        unmount: () => this.unloadMFE(name),
        metadata: mfeMetadata
      };

    } catch (error) {
      console.error(`Failed to load MFE "${name}":`, error);
      
      // Display error in container if available
      this._displayError(containerSelector, name, error);
      
      // Re-throw to allow caller to handle
      throw new Error(`MFE load failed: ${name} - ${error.message}`);
    }
  }

  /**
   * Unload and cleanup a microfrontend
   * @param {string} name - The name of the MFE to unload
   * @returns {Promise<boolean>} True if successfully unloaded
   */
  async unloadMFE(name) {
    if (!this.loadedMFEs.has(name)) {
      console.warn(`MFE "${name}" is not loaded`);
      return false;
    }

    try {
      console.log(`Unloading MFE: ${name}`);

      const mfeMetadata = this.loadedMFEs.get(name);

      // Call the MFE's cleanup/destroy method if it exists
      if (mfeMetadata.instance && typeof mfeMetadata.instance.unmount === 'function') {
        await mfeMetadata.instance.unmount();
      } else if (mfeMetadata.instance && typeof mfeMetadata.instance.destroy === 'function') {
        await mfeMetadata.instance.destroy();
      }

      // Remove container element from DOM
      if (mfeMetadata.container && mfeMetadata.container.parentNode) {
        mfeMetadata.container.innerHTML = '';
      }

      // Remove from loaded MFEs map
      this.loadedMFEs.delete(name);

      // Update current MFE
      if (this.currentMFE === name) {
        this.currentMFE = null;
      }

      console.log(`MFE "${name}" unloaded successfully`);
      return true;

    } catch (error) {
      console.error(`Error unloading MFE "${name}":`, error);
      // Still remove from map even if cleanup failed
      this.loadedMFEs.delete(name);
      return false;
    }
  }

  /**
   * Get the currently active MFE
   * @returns {string|null} The name of the current MFE
   */
  getCurrentMFE() {
    return this.currentMFE;
  }

  /**
   * Check if an MFE is loaded
   * @param {string} name - The name of the MFE
   * @returns {boolean} True if the MFE is loaded
   */
  isLoaded(name) {
    return this.loadedMFEs.has(name);
  }

  /**
   * Get metadata for a loaded MFE
   * @param {string} name - The name of the MFE
   * @returns {Object|null} The MFE metadata or null if not loaded
   */
  getMFEMetadata(name) {
    return this.loadedMFEs.get(name) || null;
  }

  /**
   * Get all loaded MFE names
   * @returns {Array<string>} Array of loaded MFE names
   */
  getLoadedMFEs() {
    return Array.from(this.loadedMFEs.keys());
  }

  /**
   * Load a remote MFE using iframe approach
   * @private
   * @param {string} name - The remote name
   * @returns {Promise<Object>} A mock module object with iframe reference
   */
  async _importRemoteModule(name) {
    try {
      // Get the MFE URL configuration
      const mfeUrls = {
        'mfe1': 'http://localhost:4201'
      };
      
      const mfeUrl = mfeUrls[name];
      if (!mfeUrl) {
        throw new Error(`Unknown MFE: ${name}`);
      }
      
      console.log(`Loading MFE via iframe from: ${mfeUrl}`);
      
      // Return a mock module that will be used to create an iframe
      return {
        mount: (container) => this._mountIframe(container, mfeUrl, name),
        isIframe: true
      };
    } catch (error) {
      throw new Error(`Failed to import remote module "${name}": ${error.message}`);
    }
  }

  /**
   * Mount an MFE in an iframe
   * @private
   * @param {HTMLElement} container - The container element
   * @param {string} url - The MFE URL
   * @param {string} name - The MFE name
   * @returns {Object} Object with unmount function
   */
  _mountIframe(container, url, name) {
    // Create iframe element
    const iframe = document.createElement('iframe');
    iframe.id = `mfe-iframe-${name}`;
    iframe.src = url;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.minHeight = '600px';
    
    // Add loading indicator
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'iframe-loading';
    loadingDiv.innerHTML = `
      <div class="loading">
        <div class="loading-spinner"></div>
        <p>Loading ${name}...</p>
      </div>
    `;
    
    container.appendChild(loadingDiv);
    
    // Handle iframe load
    iframe.onload = () => {
      console.log(`Iframe loaded for ${name}`);
      loadingDiv.remove();
    };
    
    iframe.onerror = () => {
      console.error(`Failed to load iframe for ${name}`);
      loadingDiv.innerHTML = `
        <div class="mfe-error">
          <h3>Failed to Load</h3>
          <p>Could not load ${name} from ${url}</p>
          <p>Make sure the MFE server is running.</p>
        </div>
      `;
    };
    
    // Append iframe to container
    container.appendChild(iframe);
    
    console.log(`Iframe mounted for ${name}`);
    
    // Return unmount function
    return {
      unmount: () => {
        console.log(`Unmounting iframe for ${name}`);
        if (iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
        if (loadingDiv.parentNode) {
          loadingDiv.parentNode.removeChild(loadingDiv);
        }
      }
    };
  }

  /**
   * Bootstrap the MFE with the container
   * @private
   * @param {Object} remoteModule - The imported remote module
   * @param {HTMLElement} container - The container element
   * @param {Object} options - Bootstrap options
   * @returns {Promise<Object>} The MFE instance with unmount method
   */
  async _bootstrapMFE(remoteModule, container, options) {
    // Check if this is an iframe-based module
    if (remoteModule.isIframe) {
      const mountFn = remoteModule.mount;
      if (typeof mountFn !== 'function') {
        throw new Error('Iframe module does not have a mount function');
      }
      return mountFn(container, options);
    }
    
    // Original Module Federation approach (kept for compatibility)
    const mountFn = remoteModule.mount || remoteModule.bootstrap || remoteModule.default?.mount;

    if (typeof mountFn !== 'function') {
      throw new Error('Remote module does not export a mount or bootstrap function');
    }

    // Call the mount function with the container
    // The mount function should return an object with an unmount method
    const result = await mountFn(container, options);
    
    // Validate that we got an unmount function back
    if (!result || typeof result.unmount !== 'function') {
      console.warn('MFE mount function did not return a valid unmount method');
      return {
        unmount: () => {
          console.warn('No unmount method available, clearing container manually');
          container.innerHTML = '';
        }
      };
    }

    return result;
  }

  /**
   * Get or create a container element
   * @private
   * @param {string|HTMLElement} containerSelector - Container element or selector
   * @returns {HTMLElement|null} The container element
   */
  _getOrCreateContainer(containerSelector) {
    if (containerSelector instanceof HTMLElement) {
      return containerSelector;
    }

    if (typeof containerSelector === 'string') {
      let container = document.querySelector(containerSelector);
      
      // If container doesn't exist, create it
      if (!container) {
        container = document.createElement('div');
        container.id = containerSelector.replace('#', '');
        document.body.appendChild(container);
      }

      return container;
    }

    return null;
  }

  /**
   * Display an error message in the container
   * @private
   * @param {string|HTMLElement} containerSelector - Container element or selector
   * @param {string} mfeName - The name of the MFE that failed
   * @param {Error} error - The error object
   */
  _displayError(containerSelector, mfeName, error) {
    try {
      const container = typeof containerSelector === 'string'
        ? document.querySelector(containerSelector)
        : containerSelector;

      if (container) {
        // Clear container
        container.innerHTML = '';
        
        // Create error fallback UI with retry and home actions
        const errorFallback = createMFEFallback(
          mfeName,
          error,
          () => {
            // Retry loading the MFE
            this.loadMFE(mfeName, containerSelector).catch(err => {
              console.error('Retry failed:', err);
            });
          },
          () => {
            // Navigate to home
            if (window.router) {
              window.router.navigate('/');
            } else {
              window.location.href = '/';
            }
          }
        );
        
        container.appendChild(errorFallback);
      }
    } catch (displayError) {
      console.error('Failed to display error message:', displayError);
      // Fallback to simple error message if error boundary fails
      if (container) {
        container.innerHTML = `
          <div class="mfe-error">
            <h2>Failed to Load Module</h2>
            <p>Unable to load the microfrontend: <strong>${mfeName}</strong></p>
            <p>Please refresh the page or contact support.</p>
          </div>
        `;
      }
    }
  }
}

// Export a singleton instance
export const mfeLoader = new MFELoader();
export default mfeLoader;
