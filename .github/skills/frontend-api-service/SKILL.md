---
name: frontend-api-service
description: Focuses on the API communication contract, JsonResponse handling, and the connection between Services and Hooks.
---

# Frontend: API Communication & Data Handling Protocol

This skill focuses on the data-driven communication between the Frontend and Backend, ensuring robust error handling and type-safe data flow.

## 1. Unified API Communication (The Unified Handler)

### **Security & Interceptors**

- **Authorization**:
  - The Frontend Axios instance MUST implement a **Request Interceptor** to attach `Authorization: Bearer <token>` to every request.
- **Token Refresh (401 Handling)**:
  - When an API returns **401 (Unauthorized)**:
    1. The interceptor MUST attempt to use the **Refresh Token** to obtain a new Access Token.
    2. If successful, update the store and **retry** the original request.
    3. If refresh fails, clear session and redirect to `/login`.
- **Access Violation (495 Handling)**:
  - If `handleApiResponse` catches **495 (NoPermission)**:
    - This indicates the user has entered an illegal route or lacks specific module access.
    - **Action**: Immediately clear the session state (if necessary) and **redirect directly to `/home`**.

### **API Response Parsing**

All frontend services MUST process API responses through a central handler in `apiClient.ts` to ensure consistent handling of `ResponseStateEnum`.

### **Gold Standard Implementation (Reference)**

```typescript
export const handleApiResponse = <T>(
  response: AxiosResponse<JsonResponse<T>>,
): T => {
  const { state, message, result } = response.data;

  switch (state) {
    case 111: // Success: Execution successful, Message is null.
      return result;
    case 493: // NotFound: Resource not found.
      //TODO Notifications Message
      return null as T;
    case 495: // NoPermission: Unauthorized, clear session and redirect.
      //TODO Notifications Message
      window.location.href = "/";
      throw new Error("No Permission");
    case 999: // Error: System error, auto-display message from ApiExceptionFilter.
    default:
      //TODO Notifications Message
      throw new Error(message || "API Error");
  }
};
```

## 2. API Interaction Standards

When implementing data fetching or mutations, the AI MUST follow these strict guidelines:

Service Implementation
Contract: Use apiClient to call endpoints and wrap the return with handleApiResponse.

Async Hygiene: Always include signal: AbortSignal in the function signature and pass it to the Axios request.

Example:

```typescript
export const fetchItems = async (signal?: AbortSignal) => {
  const res = await apiClient.get<JsonResponse<ItemDto[]>>("/items", {
    signal,
  });
  return handleApiResponse(res);
};
```

## 3. Hook Integration (TanStack Query)

Server State: Use useQuery for fetching and useMutation for actions.

Success Feedback: Manually trigger notifications.show within onSuccess only if a success message is required by the UI (Failure messages are already handled by the API Handler).

Invalidation: Always call queryClient.invalidateQueries after a successful mutation to keep the cache fresh.

## 4. Data Integrity & Mirroring

Type Safety: Frontend DTOs MUST be exact mirrors of Backend C# DTOs. Never use any.
