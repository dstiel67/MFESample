import { mount } from './bootstrap';

describe('Bootstrap mount function', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'test-container';
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  it('should mount the Angular app to a container element', async () => {
    const result = await mount(container);
    
    expect(result).toBeDefined();
    expect(result.unmount).toBeDefined();
    expect(typeof result.unmount).toBe('function');
    
    // Check that app-root was created
    const appRoot = container.querySelector('app-root');
    expect(appRoot).toBeTruthy();
  });

  it('should mount the Angular app using a CSS selector', async () => {
    const result = await mount('#test-container');
    
    expect(result).toBeDefined();
    expect(result.unmount).toBeDefined();
    
    // Check that app-root was created
    const appRoot = container.querySelector('app-root');
    expect(appRoot).toBeTruthy();
  });

  it('should throw an error if container is not found', async () => {
    await expectAsync(mount('#non-existent')).toBeRejectedWithError(/Container not found/);
  });

  it('should properly unmount and clean up the Angular app', async () => {
    const result = await mount(container);
    
    // Verify app-root exists
    let appRoot = container.querySelector('app-root');
    expect(appRoot).toBeTruthy();
    
    // Unmount
    result.unmount();
    
    // Verify app-root is removed
    appRoot = container.querySelector('app-root');
    expect(appRoot).toBeFalsy();
  });
});
