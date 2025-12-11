# Keamachi Project Summary

This document provides an overview of the Keamachi project structure and the purpose of its main files and directories.

## Project Structure Overview

The project is structured with a frontend `client` application, and two backend services `keamachi-api` (likely for Vercel Serverless Functions) and a traditional `server` directory.

-   **`.github/`**: Contains GitHub Actions workflows for continuous integration.
-   **`client/`**: The React frontend application.
-   **`keamachi-api/`**: A backend service, potentially designed for serverless deployment (e.g., Vercel Functions).
-   **`server/`**: Another backend service, likely a traditional Node.js/Express application.
-   **`.env.example`**: Example file for environment variables.
-   **`package.json`**: Main project dependencies and scripts.
-   **`README.md`**: Project README.
-   **`vercel.json`**: Vercel deployment configuration for the frontend.

---

## Detailed Directory and File Descriptions

### `client/` (Frontend Application)

This directory contains the React frontend application built with Vite.

-   **`client/index.html`**: The main HTML file for the single-page application.
-   **`client/package.json`**: Dependencies and scripts specific to the frontend application.
-   **`client/vite.config.ts`**: Vite configuration for the frontend build and development server.
-   **`client/tsconfig.json`, `client/tsconfig.node.json`, `client/vite-env.d.ts`**: TypeScript configuration files.
-   **`client/.env`**: Environment variables for the client-side application (e.g., Supabase API keys).

#### `client/src/`

-   **`client/src/main.tsx`**: The entry point of the React application. It renders the `App` component, wrapping it with `React.StrictMode` and `AuthProvider` to provide authentication context to the entire application.
-   **`client/src/App.tsx`**: The root component of the React application. It sets up client-side routing using `react-router-dom` and defines protected routes using the `useAuth` hook.
-   **`client/src/styles.css`, `client/src/index.css`, `client/src/App.css`**: Global and component-specific CSS styles.
-   **`client/src/api.ts`**: Configures an `axios` instance for making API calls to the backend.
-   **`client/src/types.ts`**: Defines TypeScript interfaces and types used across the frontend, such as `Facility`, `Review`, and `SavedSearch`.
-   **`client/src/supabase.ts`**: Initializes and exports the Supabase client for client-side interactions with Supabase services (e.g., authentication, database).

#### `client/src/contexts/`

-   **`client/src/contexts/AuthProvider.tsx`**: This file defines the `AuthContext`, the `AuthProvider` React component, and the `useAuth` hook. The `AuthProvider` manages the user's authentication session and state (user, loading, signOut) using Supabase, making it available to all components wrapped within it.

#### `client/src/hooks/`

-   **`client/src/hooks/useAuth.ts`**: This file now re-exports the `useAuth` hook from `client/src/contexts/AuthProvider.tsx`. This ensures that all components importing `useAuth` from this path correctly receive the context-based authentication hook.

#### `client/src/pages/`

-   **`client/src/pages/Home.tsx`**: The landing page of the application, displaying featured facilities and search functionality. It includes the `<BrowseFacilities>` component.
-   **`client/src/pages/Auth.tsx`**: Handles user login and registration forms.
-   **`client/src/pages/Browse.tsx`**: Displays a list of facilities with filtering and search options. It also handles displaying detailed facility information upon selection.
-   **`client/src/pages/Dashboard.tsx`**: A protected route that displays user-specific information or actions after authentication.
-   **`client/src/pages/FacilityDetail.tsx`**: Displays detailed information about a specific facility, including reviews and availability.
-   **`client/src/pages/MatchingManager.tsx`**: Manages matching requests or processes.
-   **`client/src/pages/Messaging.tsx`**: Handles in-app messaging functionality.

#### `client/src/components/`

-   **`client/src/components/AvailabilityBadges.tsx`**: Component to display the availability status of a facility.
-   **`client/src/components/ReviewForm.tsx`**: Form for users to submit reviews for facilities.
-   **`client/src/components/ReviewList.tsx`**: Displays a list of reviews for a facility.

#### `client/src/constants/`

-   **`client/src/constants/services.ts`**: Defines constants related to service types.

#### `client/src/utils/`

-   **`client/src/utils/storage.ts`**: Utility functions for safe interaction with `localStorage` (e.g., `safeGetJSON`, `safeSetJSON`).

### `keamachi-api/` (Backend Service - Serverless/Vercel Functions)

This directory likely contains a backend service intended for deployment as serverless functions, possibly on Vercel.

-   **`keamachi-api/package.json`**: Dependencies and scripts for this backend service.
-   **`keamachi-api/vercel.json`**: Vercel specific configuration for this backend.
-   **`keamachi-api/.env.example`**: Example environment variables for the API (e.g., database connection strings, Supabase keys).

#### `keamachi-api/api/`

-   **`keamachi-api/api/facilities.ts`**: API routes related to facility management.
-   **`keamachi-api/api/health.ts`**: API route for health checks.
-   **`keamachi-api/api/index.ts`**: The main entry point for the API routes.

#### `keamachi-api/lib/`

-   **`keamachi-api/lib/db.ts`**: Database connection and query logic.
-   **`keamachi-api/lib/supabaseServer.js`**: Server-side Supabase client initialization.

#### `keamachi-api/migrations/`

-   **`keamachi-api/migrations/001_create_facilities_table.ts`**: Database migration script for creating the facilities table.
-   **`keamachi-api/migrations/002_add_search_fields_to_facilities.ts`**: Database migration script for adding search-related fields to facilities.

### `server/` (Traditional Backend Service)

This directory seems to contain another backend service, possibly a more traditional Node.js/Express application.

-   **`server/index.ts`**: The main entry point for the traditional backend application.
-   **`server/db.ts`**: Database connection and query logic for this server.

#### `server/middleware/`

-   **`server/middleware/auth.ts`**: Authentication middleware for routes.

#### `server/migrations/`

-   **`server/migrations/run.js`**: Script to run database migrations.

#### `server/routes/`

-   **`server/routes/auth.ts`**: Routes for user authentication.
-   **`server/routes/facilities.ts`**: Routes for facility-related operations.
-   **`server/routes/matching.ts`**: Routes for matching functionalities.
-   **`server/routes/messages.ts`**: Routes for messaging functionalities.
-   **`server/routes/users.ts`**: Routes for user management.

#### `server/seeds/`

-   **`server/seeds/seed_facilities.js`**: Script to seed initial data into the facilities table.

---

## Long File Analysis

Upon review, no single file appears to be excessively long or complex to warrant immediate functional decomposition. Key files like `Browse.tsx` and `FacilityDetail.tsx` are comprehensive but maintain a clear structure for their respective responsibilities. If specific areas within these files become more complex in the future, they could be refactored into smaller, more focused components or hooks.

---
