# AbleSpace — Task Management System

Full Stack Developer (Fresher) technical assessment build.

## Tech Stack
- **Frontend:** Next.js 14 (App Router) + Tailwind CSS
- **Backend:** NestJS
- **Database:** SQLite (via Prisma) locally — see deployment notes below for Postgres in production
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

Open `http://localhost:3000/login`. Click **Continue as Guest** to get started —
this creates a guest user + workspace and takes you straight into the Tasks board.
No external setup (API keys, OAuth config) is required for guest login.

To test **Sign in with Google**, also set `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`
in `backend/.env` and `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in `frontend/.env.local`.

## What's implemented

**Auth**
- Guest login — fully working, creates a throwaway user + personal workspace
- Google login — fully wired end-to-end (real Google Identity Services button on
  the frontend, ID token verified server-side against Google before trusting it)
- JWT-based auth guard on all protected API routes

**Tasks**
- Full CRUD, with validation via `class-validator` DTOs
- Kanban board (To Do / Doing / Completed / On Hold) with drag-and-drop between
  columns (`@dnd-kit`), plus manual status change via the task detail page
- List view with a Fields picker (toggle Priority / Members / Due Date / Labels /
  Status / Reporter / Teams columns on or off)
- Task detail page: status/priority/date/team editing, members, labels, subtasks
  table, comments thread, and an Updates/activity feed (status & priority changes
  are logged server-side and rendered here)
- Task dates: start date → due date range (not just a single due date), editable
  from both the Add Task modal and the task detail page, with validation that due
  date can't be before start date
- Teams: tasks can be assigned to a Team; teams are created inline from the task
  detail page's Teams dropdown ("+ New team…") and are shared across the workspace

**Projects**
- List view, create

**Theme**
- Light/dark mode + 6 accent colors (Amber, Blue, Pink, Rose, Emerald, Black)
- Persisted across refresh via `localStorage` + CSS variables on `<html>`

**Profile**
- Edit name/title/username, leave workspace

## Known deviations / not yet implemented
- Team assignment is only available from the task detail page, not from the
  Add Task modal on the Kanban board — you create the task first, then assign
  a team from its detail page
- No dedicated Teams management page (list/rename/delete teams); teams are
  created inline and can only be viewed via the task Teams dropdown
- Resources/attachments on a task are a visual placeholder only — no upload
  backend exists yet
- Reusable `components/ui/` primitives (Button, Badge, Select) exist but
  aren't used everywhere — some pages still use inline Tailwind classes
  instead of the shared components

## Project Structure
```
backend/
  prisma/schema.prisma   # data model
  src/
    auth/                 # guest + google login, JWT guard
    users/                # profile
    projects/
    tasks/                 # includes subtasks (parentTaskId), start/due dates
    teams/                 # team CRUD, assigned to tasks via teamId
    comments/
frontend/
  app/
    (auth)/login/
    (app)/tasks/, projects/, profile/
  components/
    board/                 # Kanban board, Add Task modal, Add Project modal
    list/                  # List view, Fields picker
    theme/, ui/
  lib/
    api.ts                 # fetch client
    theme-context.tsx       # light/dark + accent color, persisted
```