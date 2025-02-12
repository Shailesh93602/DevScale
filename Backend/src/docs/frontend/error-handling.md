# Frontend Error Handling Guide

## Error Types

### API Errors

```typescript
export enum ApiErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

export class ApiError extends Error {
  constructor(
    public code: ApiErrorCode,
    public message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
  }
}
```

### Error Handling Example

```typescript
try {
  const response = await apiClient.get('/protected-route');
  // Handle success
} catch (error) {
  if (error instanceof ApiError) {
    switch (error.code) {
      case ApiErrorCode.UNAUTHORIZED:
        // Redirect to login
        break;
      case ApiErrorCode.VALIDATION_ERROR:
        // Show validation errors
        break;
      default:
      // Show generic error message
    }
  }
}
```
