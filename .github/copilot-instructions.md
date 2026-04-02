# Navigation & Workflow

- **Mandatory Reference**: BEFORE generating any code or proposing architectural changes, the AI MUST read and cross-reference the files in `/openspec`.
- **Authority**: Always follow `/openspec` rules.
- **Context**: Refer to `tech-backend.md` for C#/DB, `tech-identity.md` for Identity, `tech-frontend.md` for React/UI.
- **Database**: PostgreSQL is the mandatory DB. Use Npgsql with EF Core.
- **Verification**: If a request contradicts the existing Specification, the AI MUST alert the user and ask for clarification or an `opsx` update before proceeding.
