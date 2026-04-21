---
name: recursive-refactor
description: Guide for ensuring full-stack integrity during refactoring. Use this when a change in one layer (DTO/Interface/Service) affects other parts of the system.
---

# Recursive Refactoring and Integrity

This skill ensures that code changes are applied consistently across all architectural layers, preventing broken dependencies between Frontend and Backend.

## When to use this skill

Use this skill when you need to:

- Modify a Backend DTO or API signature.
- Change a Domain Service method or Interface.
- Update shared data structures between React and .NET.

## Implementation Steps

1. **Impact Analysis**: Perform a workspace-wide search for all references of the modified element.
2. **Backend Synchronization**: Update the Entity, DTO, Mapper, and Controller in sequence.
3. **Frontend Propagation**:
   - Update the TypeScript DTO in `src/api/dtos`.
   - Update the API Service in `src/api/services`.
   - Update the React Query Hook in `src/hooks/queries`.
4. **Final Check**: Ensure all `import` statements and Dependency Injection (DI) registrations are valid.

## Best practices

- Never provide partial code updates; always output the full, functional file.
- Proactively suggest updates to the Frontend when Backend contracts change.
- Verify that no dead code or unused imports are left behind.
