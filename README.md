# AbleSpace — Task Management System

Full Stack Developer (Fresher) technical assessment build.

## Tech Stack
- **Frontend:** Next.js 14 (App Router) + Tailwind CSS
- **Backend:** NestJS
- **Database:** SQLite (via Prisma) — zero external setup, easy to swap for Postgres/Mongo later
- **Language:** TypeScript throughout

## Setup

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env
npx prisma migrate dev --name init   # creates dev.db and applies the schema
npm run start:dev                     # runs on http://localhost:4000
```

### 2. Frontend
```bash
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:4000" > .env.local
npm run dev                           # runs on http://localhost:3000
```

Open `http://localhost:3000/login` and click **Continue as Guest** to get started —
this creates a guest user + workspace and takes you straight into the Tasks board.

## What's implemented
- Guest login (fully working, no external setup)
- Google login (backend endpoint scaffolded; needs `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`
  in `.env` and a real OAuth flow wired on the frontend to go live)
- Tasks: full CRUD, Kanban board (To Do / Doing / Completed / On Hold), task detail
  view with subtasks table and comments
- Projects: list view, create
- Theme system: light/dark mode + 6 accent colors (Amber, Blue, Pink, Rose, Emerald,
  Black), persisted across refresh via localStorage + CSS variables
- Profile page: edit name/title/username, leave workspace
- JWT-based auth guard on all protected API routes

## Known deviations / not yet implemented
*(document anything else you change while building further)*
- List view + column Fields picker (checkboxes for Priority/Members/Due Date/etc.)
  is not yet built — board view is the primary view for now
- Drag-and-drop between Kanban columns is not implemented; status changes currently
  go through the task detail page
- Google OAuth is stubbed, not connected to a real Google flow
- Activity/Updates feed is logged on the backend (status & priority changes, comments)
  but not yet rendered in the task detail UI
- Reusable `components/ui/` primitives (Button, Badge) exist but aren't yet used
  everywhere — some pages still have inline Tailwind classes

## Project Structure
```
backend/
  prisma/schema.prisma   # data model
  src/
    auth/                 # guest + google login, JWT guard
    users/                # profile
    projects/
    tasks/                 # includes subtasks via parentTaskId
    comments/
frontend/
  app/
    (auth)/login/
    (app)/tasks/, projects/, profile/
  components/
    board/, theme/, ui/
  lib/
    api.ts                 # fetch client
    theme-context.tsx       # light/dark + accent color, persisted
```
