---
name: auto-verify
description: Guide for automated testing using xUnit, AwesomeAssertions, and Chrome DevTools MCP. Use this to perform real-time browser verification and unit testing.
---

# Automated Verification Protocol

This skill leverages Backend Unit Tests (with AwesomeAssertions) and the **Chrome DevTools MCP Server** to ensure system reliability.

## When to use this skill

Use this skill when you need to:

- Verify UI rendering and interaction in a real browser context using MCP.
- Write unit tests for business logic with fluent, readable assertions.
- Validate API responses and database state transitions.

## Testing Procedures

### 1. Frontend Integration (via Chrome DevTools MCP)

- **Live Inspect**: Use MCP to capture the DOM state and verify Mantine components.
- **Network Trace**: Inspect XHR calls via MCP to ensure `AbortSignal` is active and DTOs are correct.
- **Console Audit**: Use the MCP Console logs to check for React warnings or errors.

### 2. Backend Unit Testing (xUnit + AwesomeAssertions)

- **Tooling**: Use `AwesomeAssertions` for readable, fluent test results.
- **Mocking**: Use `NSubstitute` for service dependencies.
