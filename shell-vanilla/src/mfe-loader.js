/**
 * MFE Loader Module
 * Handles dynamic loading of microfrontends via Native Federation
 * Manages MFE lifecycle, container elements, and error handling
 * 
 * Uses vanilla-native-federation library to load Native Federation modules
 * from vanilla JS without framework dependencies.
 */

import { createMFEFallback } from './error-boundary.js';
import { initFederation } from 'vanilla-native-federation';

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
   * Initialize vanilla-native-federation
   * @private
   */
  async _initFederation() {
    if (this.federationInitialized) {
      return this.loadRemoteModule;
    }

    try {
      console.log('Initializing vanilla-native-federation...');
      
      // Initialize with the manifest
      // Maps remote names to their remoteEntry.json URLs
      const { loadRemoteModule } = await initFederation({
        'mfe1': 'http://localhost:4201/remoteEntry.json'
      });
      
      this.loadRemoteModule = loadRemoteModule;
      this.federationInitialized = true;
      
      console.log('vanilla-native-federation initialized successfully');
      return loadRemoteModule;
    } catch (error) {
      console.error('Failed to initialize vanilla-native-federation:', error);
      throw error;
    }
  }

  /**
   * Load a remote MFE using vanilla-native-federation
   * @private
   * @param {string} name - The remote name
   * @returns {Promise<Object>} The loaded module
   */
  async _importRemoteModule(name) {
    try {
      console.log(`Loading remote module "${name}" via vanilla-native-federation...`);
      
      // Initialize federation if not already done
      const loadRemoteModule = await this._initFederation();
      
      // Load the bootstrap module from the remote
      // vanilla-native-federation handles:
      // - Fetching remoteEntry.json
      // - Resolving shared dependencies
      // - Loading the requested module
      console.log(`Loading module: ${name}/./bootstrap`);
      const module = await loadRemoteModule(name, './bootstrap');
      
      console.log(`Successfully loaded module from ${name}`, module);
      
      return module;
    } catch (error) {
      console.error(`Failed to load remote module "${name}":`, error);
      throw new Error(`Failed to import remote module "${name}": ${error.message}`);
    }
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
    // Look for a mount function in the module
    const mountFn = remoteModule.mount || remoteModule.bootstrap || remoteModule.default?.mount;

    if (typeof mountFn !== 'function') {
      throw new Error('Remote module does not export a mount or bootstrap function');
    }

    console.log('Calling MFE mount function...');

    // Call the mount function with the container
    const result = await mountFn(container, options);
    
    console.log('MFE mounted successfully');
    
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
