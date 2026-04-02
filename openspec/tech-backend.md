# Backend Spec: .NET 10 & PostgreSQL

## Solution Structure

- **Root**: `Backend/` (contains `.sln`).
- **Source**: `Backend/src/` (contains all projects).
- **Test**: `Backend/tests/` (contains xUnit projects).

## Project Structure Rules

- **Domain**: Zero dependencies. (Core logic/Entities/Specs).
- **Application**: Depends on **Domain**. (Defines Interfaces for Infra).
- **Infrastructure**: Depends on **Application** & **Domain**. (Implements Interfaces).
- **Api**: Depends on **ALL**. (The "Glue" that performs DI registration).

## API & Security Standards

- **DTO Consolidation**:
  Core Business: All business-related Request/Response DTOs MUST be placed in .Application/Dtos.
  Identity Module: Identity-specific DTOs (e.g., LoginRequest, TokenResponse) SHOULD be placed within Identity-Project/Dtos to maintain module encapsulation.
- **Strong Typing**: Controllers MUST use ActionResult<TResponseDto>. Avoid raw IActionResult.
- **Thin Controllers**: No business or database logic in Controllers. Maximum 30 lines per action.
- **Logic Location (Application Service Pattern)**: Business Flow & Database Access: MUST be encapsulated in Application/Services/.
- **Database Access**: Application Services interact with the database via Interfaces (e.g., IAppDbContext) defined within the Application layer.
- **Implementation**: The actual EF Core AppDbContext and PostgreSQL configurations reside in Infrastructure, satisfying the interfaces defined by Application.

## DB & Persistence

- **Provider**: Npgsql.EntityFrameworkCore.PostgreSQL.
- **Naming**: Use Snake Case for Postgres naming conventions (optional) or Standard PascalCase.
- **ID Strategy**: **ULID** (Universally Unique Lexicographically Sortable Identifier).
- **Configuration**: Every entity must have a corresponding configuration class.
- **Metadata**: Every entity configuration MUST include .HasComment() for tables and columns to provide database-level documentation.

```csharp
public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        // 1. Explicitly define table name in snake_case
        builder.ToTable("orders");

        // 2. Primary Key
        builder.HasKey(x => x.Id);

        // 3. Property mapping with PostgreSQL specifics
        builder.Property(x => x.OrderNumber)
               .HasMaxLength(50)
               .IsRequired();
    }
}
```

## Domain Model Strategy

DDD Pattern

- **Base Class**: All Root entities MUST inherit `AggregateRoot`.
- **State Change**: State changes MUST occur through `TriggerAsync(event)`.
- **No Repository**: Inject `AppDbContext` directly. Use `await db.SaveChangesAsync()`.
- **Identity Module**: Identity entities (Users/Roles) are Non-DDD; they do not use AggregateRoot or TriggerAsync.
- **Specification**:
  Create a Specification<T> base class that defines Criteria (Expression) and Includes. To encapsulate complex LINQ queries and reusable business search rules.

```csharp
public abstract class AggregateRoot {
    private readonly List<object> _events = [];
    public async Task TriggerAsync(object @event) {
        await EnsureValidStateAsync(@event);
        await WhenAsync(@event);
        _events.Add(@event);
    }
    protected abstract Task EnsureValidStateAsync(object @event);
    protected abstract Task WhenAsync(object @event);
}
```

## Unit Tests

Focus on Domain Entities (Logic in TriggerAsync) and Specifications.
