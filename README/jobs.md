# Jobs Module

## Purpose
Job creation, listing, and management. Includes AI prompt configuration and
job watch page.

## Key Routes
- `/jobs` (list)
- `/jobs/new`
- `/jobs/[id]`
- `/jobs/[id]/resumes`
- `/job/watch`

## Key Components
- `shared/components/pages/job/AddJobForm.tsx`
- `shared/components/pages/job/JobWatchForm.tsx`
- `app/(dashboard)/jobs/page.tsx`
- `app/(dashboard)/jobs/[id]/page.tsx`
- `app/(dashboard)/jobs/[id]/resumes/page.tsx`
- `app/(dashboard)/job/watch/page.tsx`

## State/Stores
- `shared/store/pages/job/useJobStore.ts`

## API Interactions
- `GET /agency/jobs`
- `GET /agency/jobs/:id`
- `POST /agency/jobs`
- `PATCH /agency/jobs/:id`
- `PATCH /agency/jobs/:id/activate`
- `PATCH /agency/jobs/:id/inactivate`
- `GET /agency/jobs/search`
- `GET /agency/jobs/:id/resumes`
- `POST /agency/jobs/:id/ai-prompt`
- `POST /agency/job-ai-prompts`
- `PATCH /agency/job-ai-prompts/:id/activate`
- `PATCH /agency/job-ai-prompts/:id/inactivate`

