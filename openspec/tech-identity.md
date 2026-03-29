# Identity Spec: OpenIddict & Postgres

- **Storage**: Store OpenIddict tokens/apps in PostgreSQL via EF Core.
- **Flow**: Password Grant.
- **Interceptor**: Frontend Axios must attach `Authorization: Bearer <token>`.
- **UserContext**: Async `IUserContext` to fetch `UserId` from Claims.
