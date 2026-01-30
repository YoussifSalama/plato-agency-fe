# Resumes Module

## Purpose
Resume ingestion, listing, detail view, and actions (shortlist/deny/invite).

## Key Routes
- `/resumes`
- `/resumes/[id]`
- `/jobs/[id]/resumes`

## Key Components
- `shared/components/pages/resume/all/ResumeTable.tsx`
- `shared/components/pages/resume/all/ResumeClient.tsx`
- `shared/components/pages/resume/details/ResumeDetailsClient.tsx`
- `app/(dashboard)/resumes/page.tsx`
- `app/(dashboard)/resumes/[id]/page.tsx`
- `app/(dashboard)/jobs/[id]/resumes/page.tsx`

## State/Stores
- `shared/store/pages/resume/useResumeStore.ts`
- `shared/store/pages/resume/useResumeDetailsStore.ts`
- `shared/store/pages/job/useJobStore.ts` (job resumes list)

## API Interactions
- `POST /resume/process`
- `GET /resume`
- `GET /resume/:id`
- `GET /resume/single/:id`
- `PATCH /resume/:id/shortlist`
- `PATCH /resume/:id/deny`
- `POST /resume/:id/invite`

