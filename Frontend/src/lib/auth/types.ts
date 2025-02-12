export type AuthErrorType =
  | 'invalid_credentials'
  | 'email_not_verified'
  | 'rate_limited'
  | 'oauth_error'
  | 'network_error'
  | 'unknown_error';

export interface AuthResponse {
  success: boolean;
  error?: AuthErrorType;
  message?: string;
  redirectTo?: string;
}
