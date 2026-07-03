# Learning Tracker

Full-stack daily goals app — email OTP login and email reminders via **Brevo**.

## Project layout

```
Learning-Tracker/
├── client/          # React frontend (Vercel)
├── server/          # Express API (Render)
├── docs/            # LAUNCH.md, structure notes
└── package.json     # Run both apps from here
```

## Tech stack

### Frontend
| Technology | Role |
|------------|------|
| **React 19** | UI & components |
| **Vite** | Dev server & production build |
| **React Router** | Client-side routing |
| **Tailwind CSS 4** | Styling & responsive layout |
| **Axios** | REST API client |
| **Recharts** | Dashboard & insights charts |
| **Framer Motion** | UI animations |

### Backend
| Technology | Role |
|------------|------|
| **Node.js** | Server runtime |
| **Express 5** | REST API |
| **MongoDB + Mongoose** | Database & data models |
| **JWT** | Authentication sessions |
| **node-cron** | Scheduled reminders & health checks |
| **Brevo API** | Login OTP + daily reminder emails |

### Deployment & services
| Service | Role |
|---------|------|
| **Vercel** | Frontend hosting |
| **Render** | Backend API hosting |
| **MongoDB Atlas** | Cloud database |
| **cron-job.org** | Wakes API & runs reminder/monitoring jobs |

**Architecture:** Full-stack monorepo — `client/` (React SPA) + `server/` (Express API).

## Run locally

```bash
npm run install:all
cp server/.env.example server/.env   # add MONGO_URI, JWT_SECRET, BREVO_API_KEY
npm run dev
```

- App: http://localhost:3000  
- API: http://localhost:5001/api  

## Deploy

See **[docs/LAUNCH.md](docs/LAUNCH.md)** for Render, Vercel, and Brevo setup.

| Platform | Root directory |
|----------|----------------|
| **Vercel** | `client` |
| **Render** | `server` |
