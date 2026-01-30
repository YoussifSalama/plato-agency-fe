# Auth Module

## Purpose
Authentication and account flows for agency users.

## Key Routes
- `/auth/login`
- `/auth/signup`
- `/auth/reset-password`
- `/auth/verify`

## Key Components
- `app/auth/login/page.tsx`
- `app/auth/signup/page.tsx`
- `app/auth/reset-password/page.tsx`
- `app/auth/verify/page.tsx`

## State/Stores
- `shared/store/pages/auth/useAuthStore.ts`

## API Interactions
- `POST /agency/login`
- `POST /agency/signup`
- `POST /agency/token/refresh`
- `POST /agency/password/reset/request`
- `POST /agency/password/reset/verify`
- `POST /agency/password/reset/confirm`
- `POST /agency/verify-account/confirm`
- `POST /agency/resend-verification`

