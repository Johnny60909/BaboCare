---
name: backend-api-protocol
description: Standards for Backend API design, ResponseBase wrapping, and Exception filtering.
---

# Backend API & Contract Protocol

This skill ensures that every API endpoint produces a predictable, high-quality contract.

## 1. Response Wrapping (Mandatory)

All Controller actions MUST return one of these types:

- **`JsonResponse`**: For `void` or `Task` actions.
- **`JsonResponse<T>`**: For single object returns.
- **`JsonTableResponse<T>`**: For paginated lists (requires `Total`).

## 2. State & Message Logic

- **Success (111)**: Default state. `Message` must be `null`.
- **NotFound (493)** / **NoPermission (495)**: Set state appropriately when business logic fails.
- **Error (999)**: Let `ApiExceptionFilter` catch the exception and populate the `Message`. DO NOT use manual try-catch for basic error logging.

## 3. DTO Design

- **Location**: `Backend/Project.Application/Dtos/{Feature}/`.
- **Validation**: Use `FluentValidation` to enforce constraints before the action executes.
- **RESTful**: Use correct HTTP Verbs (POST for Create, PUT for Update, DELETE for Remove).
