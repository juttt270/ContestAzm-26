# ContestAZM 2026

Full-stack starter — **React + Vite + Tailwind CSS** frontend aur **Express + MongoDB (Atlas)** backend.

## Structure

```
ContestAZM-2026/
├── frontend/          # React + Vite + Tailwind
│   ├── public/
│   ├── src/
│   │   ├── api/           # axios client + endpoint files
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/    # Button, Loader, ...
│   │   │   └── layout/    # Navbar, Footer
│   │   ├── config/        # env.js
│   │   ├── constants/
│   │   ├── context/       # React context providers
│   │   ├── hooks/         # custom hooks
│   │   ├── layouts/       # MainLayout
│   │   ├── pages/         # Home, About, NotFound
│   │   ├── routes/        # AppRoutes
│   │   ├── services/      # non-API business logic
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── index.css      # Tailwind entry + theme
│   │   └── main.jsx
│   ├── .env / .env.example
│   ├── jsconfig.json      # "@" alias
│   └── vite.config.js
│
└── backend/           # Express + Mongoose
    ├── src/
    │   ├── config/        # env.js, db.js
    │   ├── controllers/
    │   ├── middlewares/   # auth, error, notFound, rateLimiter
    │   ├── models/        # user.model.js
    │   ├── routes/        # index.js + module routes
    │   ├── services/
    │   ├── utils/         # ApiError, ApiResponse, asyncHandler, logger
    │   ├── validators/
    │   ├── app.js         # express app
    │   └── server.js      # entry point
    └── .env / .env.example
```

## Setup

**Backend**

```bash
cd backend
npm install
cp .env.example .env    # phir MONGO_URI apna Atlas string daalein
npm run dev             # http://localhost:5000
```

**Frontend**

```bash
cd frontend
npm install
cp .env.example .env
npm run dev             # http://localhost:5173
```

## Frontend ↔ Backend connection

- Frontend `VITE_API_BASE_URL` (`.env`) se backend ka base URL leta hai → `src/config/env.js` → `src/api/axiosClient.js`.
- Backend `CLIENT_URL` (`.env`) se CORS origin allow karta hai.
- Dev me `vite.config.js` ka proxy `/api` requests ko backend par forward kar deta hai.
- Home page `GET /api/v1/health` call karke connection status dikhata hai.

## Environment variables

| Backend (`backend/.env`) | Kaam |
| --- | --- |
| `NODE_ENV` | development / production |
| `PORT` | server port (5000) |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | JWT signing key |
| `JWT_EXPIRES_IN` | token validity (7d) |
| `CLIENT_URL` | CORS allowed origin |

| Frontend (`frontend/.env`) | Kaam |
| --- | --- |
| `VITE_API_BASE_URL` | backend API base URL |
| `VITE_API_PROXY_TARGET` | Vite dev proxy target |
| `VITE_APP_NAME` | app ka naam |

> `.env` files git me ignore hain — sirf `.env.example` commit hoti hai.
