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

## DB & Persistence

- **Provider**: Npgsql.EntityFrameworkCore.PostgreSQL.
- **Naming**: Use Snake Case for Postgres naming conventions (optional) or Standard PascalCase.
- **ID Strategy**: **ULID** (Universally Unique Lexicographically Sortable Identifier).
- **Configuration**: Every entity must have a corresponding configuration class.

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
