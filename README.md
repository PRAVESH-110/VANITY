# VANITY — Startup Onboarding & Activation Engine

> **"Turn signups into activation."**  
> A full-stack MVP that guides new users through a dynamic, role-based onboarding flow — from registration to their first success moment.

---

## Table of Contents

1. [Problem Statement](#problem-statement)
2. [Architecture Overview](#architecture-overview)
3. [Tech Stack](#tech-stack)
4. [How the Onboarding Flow Works](#how-the-onboarding-flow-works)
5. [Database Models](#database-models)
6. [API Endpoints](#api-endpoints)
7. [Environment Variables](#environment-variables)
8. [Installation & Setup](#installation--setup)
9. [Seeding the Database](#seeding-the-database)
10. [Running Locally](#running-locally)

---

## Problem Statement

Most SaaS products lose a majority of new users in the first 24 hours — not because their product is bad, but because users never reach their **activation moment** (the point where they first experience value).

**VANITY** solves this by:
- Asking users about their role and goal at signup
- Dynamically assigning the right onboarding flow (Developer / Founder / Marketer)
- Walking users through step-by-step tasks that lead to their first success
- Tracking completion progress in real time

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   VANITY MVP                        │
│                                                     │
│  React (Vite + TypeScript)   Node.js + Express      │
│  ┌───────────────────┐       ┌──────────────────┐   │
│  │  Login / Register │──────▶│  /api/auth       │   │
│  │  Onboarding Flow  │──────▶│  /api/flow       │   │
│  │  Step Renderer    │──────▶│  /api/progress   │   │
│  │  Dashboard        │──────▶│  /api/projects   │   │
│  └───────────────────┘       └────────┬─────────┘   │
│                                       │             │
│                                  MongoDB Atlas      │
│                           (User, Flow, Step,        │
│                            UserProgress, Project)   │
└─────────────────────────────────────────────────────┘
```

The frontend communicates via **Axios** with a JWT-authenticated REST API. Socket.IO is available for real-time deployment status updates.

---

## Tech Stack

| Layer      | Technology            |
|------------|-----------------------|
| Frontend   | React 19 + Vite + TypeScript |
| Styling    | Tailwind CSS + Custom CSS Variables |
| HTTP Client| Axios                 |
| Backend    | Node.js + Express 5   |
| Database   | MongoDB + Mongoose    |
| Auth       | JWT (jsonwebtoken)    |
| Password   | bcryptjs              |
| Real-time  | Socket.IO             |

---

## How the Onboarding Flow Works

```
User Registers
     │
     ▼
User selects Role (developer / founder / marketer)
     │
     ▼
User Logs In → JWT issued
     │
     ├─ onboardingCompleted = false → /onboarding
     └─ onboardingCompleted = true  → /dashboard
               │
               ▼
        GET /api/flow/my-flow
        (fetches flow based on user.segment = user.role)
               │
               ▼
        Displays Steps (info → action → form)
               │
               ▼  (each step)
        POST /api/progress/complete
        { stepNumber, flowId }
               │
               ▼
        GET /api/progress → % completion
               │
               ▼  (final step)
        POST /api/progress/complete-onboarding
        user.onboardingCompleted = true
               │
               ▼
           /dashboard
```

---

## Database Models

### User
| Field               | Type    | Description                        |
|---------------------|---------|------------------------------------|
| email               | String  | Unique email                       |
| password            | String  | Hashed with bcryptjs               |
| role                | String  | developer / founder / marketer     |
| goal                | String  | User's stated goal                 |
| segment             | String  | Derived from role (used for flow)  |
| onboardingCompleted | Boolean | Whether they finished onboarding   |

### Flow
| Field          | Type   | Description                              |
|----------------|--------|------------------------------------------|
| segment        | String | developer / founder / marketer           |
| activationGoal | String | The activation milestone for this flow   |

### Step
| Field               | Type     | Description                            |
|---------------------|----------|----------------------------------------|
| flowId              | ObjectId | Reference to parent Flow               |
| type                | String   | info / action / form                   |
| title               | String   | Step title displayed in UI             |
| description         | String   | Detailed instructions for the step     |
| order               | Number   | Step sequence (1-indexed)              |
| completionCondition | String   | Optional condition string              |

### UserProgress
| Field          | Type       | Description                             |
|----------------|------------|-----------------------------------------|
| userId         | ObjectId   | Reference to User                       |
| flowId         | ObjectId   | Reference to Flow                       |
| currentStep    | Number     | Index of the current step               |
| completedSteps | [Number]   | Array of completed step order numbers   |

---

## API Endpoints

### Auth
| Method | Endpoint            | Auth | Description         |
|--------|---------------------|------|---------------------|
| POST   | /api/auth/register  | ❌   | Register new user   |
| POST   | /api/auth/login     | ❌   | Login + get JWT     |

### User
| Method | Endpoint          | Auth | Description                  |
|--------|-------------------|------|------------------------------|
| GET    | /api/user/me      | ✅   | Get current user profile     |
| POST   | /api/user/profile | ✅   | Update role + goal + segment |

### Onboarding Flow
| Method | Endpoint           | Auth | Description                          |
|--------|--------------------|------|--------------------------------------|
| GET    | /api/flow/my-flow  | ✅   | Get flow + steps for current user    |

### Progress
| Method | Endpoint                          | Auth | Description                      |
|--------|-----------------------------------|------|----------------------------------|
| GET    | /api/progress                     | ✅   | Get current progress + %         |
| POST   | /api/progress/complete            | ✅   | Mark a step complete             |
| POST   | /api/progress/complete-onboarding | ✅   | Mark onboarding fully complete   |

### Projects
| Method | Endpoint               | Auth | Description              |
|--------|------------------------|------|--------------------------|
| GET    | /api/projects          | ✅   | Get all user projects    |
| POST   | /api/projects          | ✅   | Create new project       |
| DELETE | /api/projects/:id      | ✅   | Delete project           |
| POST   | /api/projects/deploy   | ✅   | Trigger project deploy   |

---

## Response Format

All endpoints return consistent JSON:

```json
{
  "success": true,
  "message": "Optional message",
  "data": { }
}
```

Error responses:

```json
{
  "success": false,
  "message": "Description of the error"
}
```

---

## Environment Variables

### Backend (`vanity-server/.env`)

```env
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/vanity
JWT_SECRET=your-super-secret-key
GITHUB_TOKEN=ghp_yourGitHubPersonalAccessToken
```

---

## Installation & Setup

### Prerequisites

- Node.js ≥ 18
- MongoDB Atlas account (free tier works)
- Git

### 1. Clone the repo

```bash
git clone https://github.com/yourname/vanity.git
cd vanity/VANITY
```

### 2. Backend Setup

```bash
cd vanity-server
npm install
```

Create/edit `.env`:

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/vanity?retryWrites=true&w=majority
JWT_SECRET=supersecretkey123
GITHUB_TOKEN=ghp_yourToken
```

### 3. Frontend Setup

```bash
cd ../vanity-client
npm install
```

---

## Seeding the Database

After setting up your `.env` with a valid `MONGO_URI`, seed the onboarding flows:

```bash
cd vanity-server
npm run seed
```

This creates 3 flows (developer, founder, marketer), each with 3 steps.

---

## Running Locally

### Start Backend

```bash
cd vanity-server
npm run dev
# Server running on http://localhost:5000
```

### Start Frontend

```bash
cd vanity-client
npm run dev
# App running on http://localhost:5173
```

### Visit the app

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Frontend API Layer

The frontend includes a clean API service layer:

```
src/
  api/
    axios.ts        ← Axios instance (auto-attaches JWT)
    authApi.ts      ← register / login
    userApi.ts      ← getMe / updateProfile
    onboardingApi.ts← getFlow / getProgress / completeStep / completeOnboarding
  hooks/
    useAuth.ts      ← login/register/logout with navigation
    useOnboarding.ts← loads flow + manages step progression
    useProgress.ts  ← fetches progress %
```

---

## Project Structure

```
VANITY/
├── vanity-server/
│   ├── config/          db.js
│   ├── controllers/     auth, user, flow, progress, project, apiKey, campaign
│   ├── middleware/       auth (JWT guard), error handler
│   ├── models/          User, Flow, Step, UserProgress, Project, ApiKey, Campaign
│   ├── routes/          authRoutes, userRoutes, flowRoutes, progressRoutes, projectRoutes, ...
│   ├── services/        projectService.js
│   ├── seed.js          database seeder
│   └── server.js        Express + Socket.IO entry point
│
└── vanity-client/
    └── src/
        ├── api/         axios.ts, authApi.ts, userApi.ts, onboardingApi.ts
        ├── hooks/       useAuth.ts, useOnboarding.ts, useProgress.ts
        ├── context/     AuthContext.tsx
        ├── components/  Layout.tsx, StepRenderer.tsx, DeploymentTimeline.tsx
        └── pages/       Login, Register, Onboarding, Dashboard, ProjectDetails
```

---

## License

MIT — built by Prem Fagoriya
