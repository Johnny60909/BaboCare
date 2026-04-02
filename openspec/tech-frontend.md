# Frontend Specification

## Core Stack

- **Framework**: React with React Router v7 (SPA Mode).
- **UI Library**: Mantine UI v7 (Components) & Tailwind CSS (Utility-first Layout).
- **State Management**:
  - **Server State**: TanStack Query (React Query) for all API interactions.
  - **Local State**: Zustand for UI-only state (e.g., Sidebars, Modals).
- **Zustand (Local UI State)**:
  - **Responsibility**: Managing global UI-only states that do not persist in the database (e.g., Sidebar toggle, Theme preference, Multi-step modal data).
  - **Restriction**: Do not store API response data in Zustand if it can be managed by TanStack Query.
- **Icons**: lucide-react.

## API & Data Architecture

### DTO Strategy (Data Transfer Objects)

All data structures must mirror the Backend.

- **Location**: src/api/dtos/.
- **Strict Typing**: Never use any. Interfaces must be exported for use in Services and Hooks.

### Service Pattern

API calls must be encapsulated in dedicated Service objects.

- **Location**: src/api/services/.

### Server State (React Query)

Use Custom Hooks to wrap useQuery and useMutation.

- **Location**: src/hooks/queries/.

## Coding & Styling Standards

### Logic Separation (MVVM Pattern)

View (.tsx): Focused exclusively on rendering. No raw useEffect for fetching.

Logic (.ts): Custom hooks handle calculations, state transitions, and API triggers.

### Mantine v7 & Tailwind Integration

Strict Rule: Avoid legacy Mantine v6 syntax (createStyles, emotion).

Tailwind: Use for RWD (Responsive Design), spacing, and complex grid layouts.

Mantine: Use for high-level components (Modals, Tabs, Forms, Inputs).

### Security & Performance

Error Handling: Use Global Error Boundaries and React Query onError (or global QueryCache config) for toast notifications.

Cleanup: Always ensure signal is passed to the API client to prevent memory leaks and race conditions on component unmount.
