# Supabase Auth Implementation Checklist

## Frontend (Next.js 15)

3. **Route Protection**
   - [ ] Create middleware for protected routes
   - [ ] Add role-based access control (if needed)
   - [ ] Implement auth state synchronization between tabs

## Backend (Node.js)

1. **User Table Sync**

   - [ ] Create POST endpoint for user profile creation
   - [ ] Implement Supabase webhook handler for `auth` events
   - [ ] Add database trigger for `auth.users` -> `public.users` sync

2. **Security**

   - [ ] Add rate limiting for auth endpoints
   - [ ] Implement JWT verification middleware
   - [ ] Set up CORS policies for frontend

3. **Profile Management**
   - [ ] Create endpoint for profile updates
   - [ ] Add email change verification flow
   - [ ] Implement password strength validation

## Supabase Configuration

1. **Email Templates**

   - [ ] Customize email confirmation template
   - [ ] Set up password recovery template
   - [ ] Configure redirect URLs in Supabase dashboard

2. **Row Level Security**

   - [ ] Enable RLS on `public.users` table
   - [ ] Create policies for user data access

3. **Webhooks**
   - [ ] Set up `user.signup` webhook to trigger Node endpoint
   - [ ] Configure `user.deleted` cleanup webhook

## Shared Requirements

1. **Error Handling**

   - [ ] Create error mapping for Supabase -> Client errors
   - [ ] Implement error boundary components
   - [ ] Add error logging integration

2. **Testing**

   - [ ] Write E2E tests for auth flows
   - [ ] Add integration tests for protected routes
   - [ ] Create mock auth state for development

3. **Documentation**
   - [ ] Add auth flow sequence diagram
   - [ ] Document environment setup
   - [ ] Create error code reference
