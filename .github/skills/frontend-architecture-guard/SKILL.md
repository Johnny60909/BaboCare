---
name: frontend-architecture-guard
description: Enforces React SPA (Mantine v8/Tailwind v4) architecture, MVVM logic separation, and Page feature implementation.
---

# Frontend Architectural Standards

## 1. Core Tech Stack

- **Framework**: React with React Router v7 (SPA Mode).
- **UI & Styling**: Mantine UI v8 (Components) + Tailwind CSS v4(Layout/RWD).
- **Icons**: `lucide-react`.

## 2. Logic Separation (MVVM Pattern)

- **View (.tsx)**: Located in `Frontend/src/pages/{Feature}/`. Focused on rendering; NO `useEffect` for data fetching.
- **Logic (.ts)**: Custom hooks in `Frontend/src/hooks/queries/{Feature}/` handle calculations and API triggers.
- **Server State**: Managed exclusively by **TanStack Query**. Do NOT store API data in Zustand.
- **Local UI State**: Use **Zustand** only for non-persistent UI states (e.g., Sidebars, Modals).

## 3. Atomic Feature Chain Implementation

Whenever a UI Feature is implemented, the AI MUST generate the following unit:

1. **DTO**: `Frontend/src/api/dtos/{Feature}/` (Mirroring Backend C#).
2. **Service**: `Frontend/src/api/services/{Feature}Service.ts` (With `AbortSignal`).
3. **Hook**: `Frontend/src/hooks/queries/{Feature}/` (Wrapping useQuery/useMutation).
4. **Page**: `Frontend/src/pages/{Feature}/` (Consuming the Hook).

## 4. Implementation Rules

- **Async Safety**: `AbortSignal` MUST be passed through the entire chain (Hook -> Service -> Axios).
- **Naming**: `camelCase` for hooks and services, `PascalCase` for Components.
- **Tests**: `Frontend/tests/e2e/{Feature}/` using Chrome DevTools MCP or Playwright.
