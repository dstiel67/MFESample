# Implementation Plan

- [x] 1. Create vanilla JavaScript shell project structure
  - Create new `shell-vanilla` directory
  - Initialize package.json with Vite and Module Federation dependencies
  - Create basic project structure (src/, public/, index.html)
  - _Requirements: 1.1, 3.1_

- [x] 2. Configure Vite with Module Federation
  - Install @originjs/vite-plugin-federation
  - Create vite.config.js with federation plugin configuration
  - Configure remotes to point to MFE1
  - Set up dev server on port 4200
  - _Requirements: 3.1, 3.3, 3.4_

- [x] 3. Create main HTML entry point
  - Create index.html with basic structure
  - Add container elements for navigation and content
  - Add MFE container div
  - Link to main.js entry point
  - _Requirements: 1.1, 1.4_

- [x] 4. Implement client-side router
  - Create router.js module
  - Implement route registration system
  - Add navigate() method with History API
  - Set up popstate event listener for back/forward
  - Handle initial route on page load
  - _Requirements: 1.5, 4.2, 4.3, 4.4_

- [ ]* 4.1 Write property test for route navigation
  - **Property 2: Route navigation consistency**
  - **Validates: Requirements 4.2, 4.3, 4.4**

- [x] 5. Implement navigation component
  - Create navigation.js module
  - Build navigation UI with links
  - Add click event handlers for client-side navigation
  - Implement active link highlighting
  - Style navigation bar
  - _Requirements: 4.1, 4.5_

- [ ]* 5.1 Write property test for navigation state
  - **Property 6: Navigation state synchronization**
  - **Validates: Requirements 4.5**

- [x] 6. Implement MFE loader module
  - Create mfe-loader.js module
  - Implement loadMFE() function to import remote modules
  - Create container management logic
  - Add error handling for failed loads
  - Track loaded MFEs in a Map
  - _Requirements: 2.1, 2.2, 2.4, 5.1_

- [ ]* 6.1 Write property test for error handling
  - **Property 4: MFE loading error handling**
  - **Validates: Requirements 2.4**

- [x] 7. Implement MFE lifecycle management
  - Add unloadMFE() function
  - Call MFE cleanup/destroy methods
  - Remove container elements from DOM
  - Ensure proper cleanup before mounting new MFE
  - _Requirements: 5.2, 5.3, 5.4_

- [ ]* 7.1 Write property test for lifecycle cleanup
  - **Property 3: MFE lifecycle cleanup**
  - **Validates: Requirements 5.2, 5.3, 5.4**

- [ ]* 7.2 Write property test for container management
  - **Property 7: Container element management**
  - **Validates: Requirements 5.1**

- [x] 8. Create main application entry point
  - Create main.js
  - Initialize router with route definitions
  - Create and mount navigation component
  - Set up home page handler
  - Set up MFE1 route handler
  - Start the application
  - _Requirements: 1.1, 1.4, 4.1_

- [x] 9. Implement home page view
  - Create home page rendering function
  - Add welcome content and description
  - Style home page
  - _Requirements: 4.1_

- [x] 10. Add global styles
  - Create styles.css
  - Add base styles and CSS reset
  - Style navigation and layout
  - Add responsive design
  - _Requirements: 1.4_

- [x] 11. Update MFE1 to expose bootstrap function
  - Modify mfe1 to export a mount function
  - Ensure mount function accepts container parameter
  - Return unmount/destroy function
  - Test MFE1 can be mounted by vanilla shell
  - _Requirements: 2.2, 2.3, 5.2_

- [x] 12. Integrate MFE1 loading in shell
  - Import MFE1 remote module in mfe-loader
  - Call MFE1's mount function with container
  - Store unmount function for cleanup
  - Handle loading states and errors
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 13. Test development workflow
  - Start MFE1 dev server
  - Start shell dev server
  - Verify hot reload works
  - Test navigation between routes
  - Verify MFE loads correctly
  - _Requirements: 3.1, 4.2, 4.3_

- [x] 14. Configure production build
  - Set up Vite build configuration
  - Test production build output
  - Verify bundle sizes
  - Ensure static files can be served
  - _Requirements: 3.2, 3.5_

- [ ]* 14.1 Write property test for build independence
  - **Property 1: Shell independence from Angular**
  - **Validates: Requirements 1.1, 6.1**

- [ ]* 14.2 Write property test for build isolation
  - **Property 5: Module Federation isolation**
  - **Validates: Requirements 6.1, 6.2**

- [x] 15. Update federation manifest
  - Create/update public/federation.manifest.json
  - Configure MFE1 remote entry URL
  - Document how to update for different environments
  - _Requirements: 6.4_

- [x] 16. Add error boundary and fallback UI
  - Create error display component
  - Add try-catch around MFE loading
  - Show user-friendly error messages
  - Ensure shell remains stable on errors
  - _Requirements: 2.4_

- [x] 17. Update documentation
  - Update README with new architecture
  - Document vanilla shell setup and commands
  - Add architecture diagrams
  - Document how to add new MFEs
  - Create troubleshooting guide
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 18. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
