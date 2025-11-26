/**
 * Navigation component for the vanilla shell
 * Handles navigation UI, click events, and active link highlighting
 */

import router from './router.js';

/**
 * Navigation configuration
 */
const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/mfe1', label: 'MFE1 Dashboard' }
];

/**
 * Create and return the navigation component
 * @returns {HTMLElement} The navigation element
 */
export function createNavigation() {
  const nav = document.createElement('nav');
  nav.id = 'navigation';
  nav.className = 'shell-navigation';

  // Create navigation list
  const ul = document.createElement('ul');
  ul.className = 'nav-list';

  // Create navigation links
  navLinks.forEach(({ path, label }) => {
    const li = document.createElement('li');
    li.className = 'nav-item';

    const a = document.createElement('a');
    a.href = path;
    a.textContent = label;
    a.className = 'nav-link';
    a.dataset.path = path;

    // Add click event handler for client-side navigation
    a.addEventListener('click', (e) => {
      e.preventDefault();
      router.navigate(path);
      updateActiveLink(path);
    });

    li.appendChild(a);
    ul.appendChild(li);
  });

  nav.appendChild(ul);

  // Set initial active link
  const currentPath = window.location.pathname;
  updateActiveLink(currentPath);

  return nav;
}

/**
 * Update the active link highlighting based on current path
 * @param {string} path - The current active path
 */
export function updateActiveLink(path) {
  // Remove active class from all links
  const allLinks = document.querySelectorAll('.nav-link');
  allLinks.forEach(link => {
    link.classList.remove('active');
  });

  // Add active class to matching link
  const activeLink = document.querySelector(`.nav-link[data-path="${path}"]`);
  if (activeLink) {
    activeLink.classList.add('active');
  } else {
    // If exact match not found, try to match home for root paths
    if (path === '/' || path === '/home') {
      const homeLink = document.querySelector('.nav-link[data-path="/"]');
      if (homeLink) {
        homeLink.classList.add('active');
      }
    }
  }
}

/**
 * Mount the navigation component to a container
 * @param {string|HTMLElement} container - The container selector or element
 * @returns {HTMLElement} The mounted navigation element
 */
export function mountNavigation(container) {
  const containerElement = typeof container === 'string' 
    ? document.querySelector(container) 
    : container;

  if (!containerElement) {
    throw new Error('Navigation container not found');
  }

  const nav = createNavigation();
  containerElement.replaceWith(nav);

  return nav;
}

export default { createNavigation, updateActiveLink, mountNavigation };
