# Requirements Document

## Introduction

This feature converts the existing Angular 20 shell application into a vanilla JavaScript shell that can dynamically load Angular 20 microfrontends using Module Federation. The goal is to create a lightweight, framework-agnostic host application that demonstrates how to integrate Angular microfrontends without requiring the shell itself to be Angular.

## Glossary

- **Shell**: The host application that loads and orchestrates microfrontends
- **MFE (Microfrontend)**: A self-contained application module that can be loaded dynamically
- **Module Federation**: A Webpack/Native Federation feature that enables runtime code sharing between applications
- **Vanilla JavaScript**: Plain JavaScript without any framework dependencies
- **Remote Entry**: The entry point file that exposes a microfrontend's modules
- **Bootstrap**: The initialization process for loading and mounting a microfrontend

## Requirements

### Requirement 1

**User Story:** As a developer, I want a vanilla JavaScript shell application, so that I can have a lightweight host without framework dependencies.

#### Acceptance Criteria

1. WHEN the shell application starts THEN the system SHALL serve static HTML, CSS, and JavaScript files without Angular dependencies
2. WHEN the shell loads THEN the system SHALL initialize Module Federation runtime for loading remote modules
3. WHEN viewing the shell's bundle size THEN the system SHALL be significantly smaller than the Angular shell
4. WHEN the shell renders THEN the system SHALL display navigation and content using vanilla DOM manipulation
5. WHERE the shell needs routing THEN the system SHALL implement client-side routing using the History API

### Requirement 2

**User Story:** As a developer, I want the vanilla shell to dynamically load Angular microfrontends, so that I can integrate framework-specific modules without coupling.

#### Acceptance Criteria

1. WHEN a user navigates to a microfrontend route THEN the system SHALL fetch the remote entry point from the configured URL
2. WHEN the remote module loads THEN the system SHALL bootstrap the Angular application in a designated container element
3. WHEN switching between routes THEN the system SHALL properly unmount the previous microfrontend and mount the new one
4. WHEN a microfrontend fails to load THEN the system SHALL display an error message and maintain shell stability
5. WHEN the microfrontend is mounted THEN the system SHALL pass any required configuration or context to the Angular app

### Requirement 3

**User Story:** As a developer, I want the shell to use Vite for development and building, so that I have fast builds and modern tooling.

#### Acceptance Criteria

1. WHEN running the development server THEN the system SHALL use Vite with hot module replacement
2. WHEN building for production THEN the system SHALL use Vite to create optimized bundles
3. WHEN configuring Module Federation THEN the system SHALL use the Vite Module Federation plugin
4. WHEN the dev server starts THEN the system SHALL serve the application on port 4200
5. WHEN building THEN the system SHALL output static files that can be served by any web server

### Requirement 4

**User Story:** As a user, I want to navigate between the shell's home page and loaded microfrontends, so that I can access different features seamlessly.

#### Acceptance Criteria

1. WHEN the application loads THEN the system SHALL display a home page with navigation links
2. WHEN clicking a navigation link THEN the system SHALL update the URL without a full page reload
3. WHEN the URL changes THEN the system SHALL load the appropriate content or microfrontend
4. WHEN navigating back/forward THEN the system SHALL respond to browser history events correctly
5. WHEN on a microfrontend route THEN the system SHALL highlight the active navigation item

### Requirement 5

**User Story:** As a developer, I want the shell to handle microfrontend lifecycle, so that resources are properly managed.

#### Acceptance Criteria

1. WHEN mounting a microfrontend THEN the system SHALL create a container element for the remote application
2. WHEN unmounting a microfrontend THEN the system SHALL call the microfrontend's cleanup/destroy method
3. WHEN unmounting THEN the system SHALL remove the container element from the DOM
4. WHEN switching microfrontends THEN the system SHALL ensure the previous one is fully unmounted before mounting the next
5. WHEN a microfrontend is active THEN the system SHALL not interfere with its internal routing or state management

### Requirement 6

**User Story:** As a developer, I want clear separation between shell and microfrontend code, so that they can be developed and deployed independently.

#### Acceptance Criteria

1. WHEN the shell builds THEN the system SHALL not include any Angular code or dependencies
2. WHEN the microfrontend builds THEN the system SHALL not include any shell-specific code
3. WHEN deploying THEN the system SHALL allow shell and microfrontends to be hosted on different domains
4. WHEN configuring remotes THEN the system SHALL use a manifest file that can be updated without rebuilding
5. WHEN sharing dependencies THEN the system SHALL only share what is explicitly configured in federation settings

### Requirement 7

**User Story:** As a developer, I want the solution to maintain SSR capability for the Angular microfrontend, so that I can still benefit from server-side rendering where needed.

#### Acceptance Criteria

1. WHEN the MFE1 builds for production THEN the system SHALL generate SSR artifacts
2. WHEN serving MFE1 with SSR THEN the system SHALL pre-render Angular components on the server
3. WHEN the shell loads a pre-rendered microfrontend THEN the system SHALL allow Angular to hydrate the content
4. WHEN MFE1 runs in development THEN the system SHALL work without SSR for faster iteration
5. WHERE SSR is enabled THEN the system SHALL maintain all Angular SSR features including hydration and event replay

### Requirement 8

**User Story:** As a developer, I want comprehensive documentation, so that I understand how to work with the vanilla shell and Angular microfrontends.

#### Acceptance Criteria

1. WHEN reviewing the project THEN the system SHALL include a README explaining the architecture
2. WHEN setting up the project THEN the system SHALL provide clear instructions for running both shell and microfrontends
3. WHEN examining the code THEN the system SHALL include comments explaining Module Federation integration
4. WHEN troubleshooting THEN the system SHALL document common issues and solutions
5. WHEN extending the system THEN the system SHALL provide examples of adding new microfrontends
