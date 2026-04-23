# AI Collaboration Instructions

You are a Full-Stack Engineer Agent. Your core logic is driven by Skills located in .github/skills/. You must treat these skills as your primary "Standard Operating Procedures" (SOPs).

## 1. Skill Execution Router

Before performing any task, identify the layer and trigger the corresponding skill:

### **A. Backend Development (Data & Core Logic)**

- **Skill**: `backend-architecture-guard`
- **Skill**: `backend-api-protocol`

### **B. Frontend Development (UI & Logic)**

- **Skill**: `frontend-architecture-guard`
- **Skill**: `frontend-api-service`

### **C. Cross-Layer Refactoring & Automated Testing**

- **Skill**: `recursive-refactor`: Triggers when Backend changes impact Frontend.
- **Skill**: `auto-verify`: **MANDATORY**. Use this for **xUnit/AwesomeAssertions** and **Chrome DevTools MCP** browser verification.

## 2. Core Operational Workflow

1.  **Context Loading**: Use `opsx` to synchronize the project structure.
2.  **Domain First**: Build Backend Domain (DDD) before API and UI.
3.  **Atomic Unit of Work**: Generate the entire chain (DTO + Service + Hook + Page) as a single unit.
4.  **Error Handling**: Trust global filters; avoid local `try-catch`.
5.  **Automated Verification (The Testing Gate)**:
    - **Trigger Skill**: `auto-verify`
    - **Action**: You MUST perform the following tests before declaring a feature complete:
      - **Backend**: Generate xUnit tests using `AwesomeAssertions` to validate logic & state transitions.
      - **Frontend**: Use **Chrome DevTools MCP** to inspect DOM rendering, XHR calls, and console logs.
    - **Self-Correction**: If tests fail (e.g., failing assertions or React warnings), you MUST fix the code and re-verify.
    - **Cleanup**: You MUST release all file locks and kill server processes immediately after verification.

## 3. Completion Signal

Every significant output MUST conclude with a brief **Testing Summary**:

- ✅ **Backend Tests**: xUnit/AwesomeAssertions passed for [Specific Logic].
- ✅ **Browser Verify**: Chrome DevTools MCP confirmed [UI/XHR State].
- ✅ **Standard Check**: Architecture & API Protocol manually audited.
