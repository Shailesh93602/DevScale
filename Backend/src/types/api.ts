// Standard API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  metadata?: {
    page?: number;
    limit?: number;
    total?: number;
    lastUpdated?: string;
  };
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

// Example usage in services
export interface UserProfile {
  id: string;
  username: string;
  email: string;
  // ... other fields
}

export type UserProfileResponse = ApiResponse<UserProfile>;
