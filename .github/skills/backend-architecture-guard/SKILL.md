---
name: backend-architecture-guard
description: Enforces .NET 10, PostgreSQL, DDD (AggregateRoot/Specification), and Backend folder structure.
---

# Backend Architectural Standards

## 1. Project Dependencies & Layering

- **Domain**: Zero dependencies. Contains `Entities`, `AggregateRoots`, and `Specifications`.
- **Application**: Depends on **Domain**. Contains `Services`, `Interfaces`, and `Dtos`.
- **Infrastructure**: Depends on **Application & Domain**. Implements `AppDbContext` and `Configurations`.
- **Identity**:
  - **Dependencies**: Depends on **Application** (to implement `IUserContext`) and **Infrastructure** (for DB access).
  - **Role**: A separate host/service (or separate assembly) for Token issuance.
- **Api**:
  - **Dependencies**: Depends on **Application** and **Infrastructure**. Performs DI registration and hosts Controllers.
  - **Authentication**: Validates Tokens via standard JWT Middleware. It does NOT reference `Identity` directly to maintain decoupling.

## 2. Security & Authentication (Identity Spec)

- **Standalone Project**: All Identity-related logic, OpenIddict configurations, and Auth flows MUST reside in a separate project named `{ProjectName}.Identity`.
- **Framework**: **OpenIddict** using Password Grant flow.
- **Storage**: Persist tokens, applications, and scopes in PostgreSQL via EF Core (within the Infrastructure project).
- **User Context (IUserContext)**:
  - **Location**: Both Interface and Implementation reside in the Application layer.
  - **Decoupling**: The Identity project handles the "How to login," while the Application layer handles "Who is the user."
- **DTO Placement**:
  - **Auth DTOs** (Login, TokenResponse): Place in `{ProjectName}.Identity/Dtos/`.
  - **Business DTOs**: Place in `{ProjectName}.Application/Dtos/`.

## 3. Domain & Persistence Strategy

- **Identity**: All entities MUST use **ULID** (Universally Unique Lexicographically Sortable Identifier) as the primary key.
- **DDD Pattern**:
  - **Root Entities**: MUST inherit `AggregateRoot` and implement state changes via `TriggerAsync(event)`.
  - **Identity Exception**: Identity entities (User/Role) are Non-DDD; they do not use `AggregateRoot`.
  - **Specifications**: Encapsulate complex LINQ queries in `Specification<T>` classes within the Domain layer.
- **PostgreSQL (Npgsql)**:
  - **Naming**: Use `snake_case` for all table and column names.
  - **Metadata**: Every entity configuration MUST include `.HasComment()` for tables and columns.

## 4. Atomic Placement Rules (Backend)

Whenever a **Domain Entity** is created or modified:

1. **Entity**: Place in `Backend/Project.Domain/Entities/{PluralRootEntities}/`.
2. **Configuration**: Create `IEntityTypeConfiguration<T>` in `Backend/Project.Infrastructure/Configurations/{PluralRootEntities}/`.
   - MUST explicitly define `ToTable("plural_name")`.
   - MUST set `.OnDelete(DeleteBehavior.NoAction)` for ALL Foreign Keys.
   - MUST include `.HasComment()`.
3. **Application Logic**:
   - **Service**: Business flow MUST be in `Application/Services/{Feature}/`. No logic in Controllers.
   - **DB Access**: Inject `AppDbContext` directly into Services (No Repository Pattern).

## 5. Testing

- **Focus**: Unit tests for Domain Entities (Logic in `TriggerAsync`) and Specifications.
- **Location**: `Backend/tests/Project.{Layer}.Tests/{Feature}/`.
