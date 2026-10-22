# College Event Management System

A full-stack MERN application for managing college events, registrations,
and users — built with React, Node.js, Express, and MongoDB.

---

## Project Structure

```
college-event-management/
├── client/                  React + Vite frontend
│   └── src/
│       ├── api/api.js       Axios instance + all API helpers
│       ├── context/         AuthContext (JWT auth state)
│       ├── components/      Shared UI components
│       └── pages/           Route-level page components
├── server/                  Node.js + Express backend
│   ├── config/db.js         MongoDB connection
│   ├── controllers/         Request handlers
│   ├── middleware/           JWT auth + role authorization
│   ├── models/              Mongoose schemas
│   ├── routes/              Express route definitions
│   └── scripts/createAdmin.js  Admin user seeder
├── docs/networking/         Computer networking documentation
└── networking/              IP addressing plan + Packet Tracer files
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running locally on port 27017

### 1. Backend

```powershell
cd server
npm install
# Generate a real JWT secret:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Paste the output into server/.env as JWT_SECRET=...

npm run dev
```

### 2. Create the first admin user

```powershell
cd server
node scripts/createAdmin.js
# Default: admin@campus.edu / Admin@1234
```

### 3. Frontend

```powershell
cd client
npm install
npm run dev
```

Open http://localhost:5173

---

## Environment Variables

### `server/.env`

| Variable       | Example                                              | Required |
|----------------|------------------------------------------------------|----------|
| PORT           | `5000`                                               | No       |
| MONGO_URI      | `mongodb://127.0.0.1:27017/college_event_management` | Yes      |
| JWT_SECRET     | (64-byte random hex string)                          | Yes      |
| JWT_EXPIRES_IN | `7d`                                                 | No       |
| CLIENT_URL     | `http://localhost:5173`                              | Yes      |
| NODE_ENV       | `development`                                        | No       |

### `client/.env` (optional)

| Variable      | Default                        |
|---------------|--------------------------------|
| VITE_API_URL  | `http://localhost:5000/api`    |

---

## API Endpoints

### Auth — `/api/auth`

| Method | Path       | Auth | Description         |
|--------|-----------|------|---------------------|
| POST   | /register | —    | Create account       |
| POST   | /login    | —    | Login, receive JWT   |
| GET    | /me       | JWT  | Current user profile |

### Events — `/api/events`

| Method | Path  | Auth              | Description           |
|--------|-------|-------------------|-----------------------|
| GET    | /     | —                 | List events           |
| GET    | /:id  | —                 | Get event details     |
| POST   | /     | organizer / admin | Create event          |
| PUT    | /:id  | organizer (owner) | Update event          |
| DELETE | /:id  | organizer (owner) | Cancel event          |

### Registrations — `/api/registrations`

| Method | Path                       | Auth              | Description               |
|--------|---------------------------|-------------------|---------------------------|
| POST   | /:eventId                 | student           | Register for event        |
| GET    | /my                       | student           | My registrations          |
| PATCH  | /:registrationId/cancel   | student           | Cancel registration       |
| GET    | /event/:eventId           | organizer / admin | Event participant list     |
| PATCH  | /:registrationId/status   | organizer / admin | Update registration status |

### Admin — `/api/admin`

| Method | Path                    | Auth  | Description            |
|--------|------------------------|-------|------------------------|
| GET    | /users                 | admin | List all users         |
| PATCH  | /users/:id/role        | admin | Change user role       |
| GET    | /events                | admin | List all events        |
| PATCH  | /events/:eventId/approve | admin | Approve event         |
| PATCH  | /events/:eventId/reject  | admin | Reject / cancel event |
| GET    | /registrations         | admin | List all registrations |

---

## User Roles

| Role      | Can do                                                    |
|-----------|-----------------------------------------------------------|
| student   | Browse events, register, cancel registrations            |
| organizer | Create events, view participants for own events          |
| admin     | All of the above + manage users and all events           |

---

## Computer Networking

See [`docs/networking/`](docs/networking/) for the full IP routing lab:
- Network topology (two subnets + router)
- Router configuration (Cisco IOS commands)
- Routing test results
- [`networking/ip-addressing-plan.md`](networking/ip-addressing-plan.md)

---

## Tech Stack

| Layer     | Technology                    |
|-----------|-------------------------------|
| Frontend  | React 19, React Router 7, Vite 8, Axios |
| Backend   | Node.js, Express 5, JWT, bcryptjs |
| Database  | MongoDB, Mongoose 9           |
| Security  | helmet, express-rate-limit    |
| Networking| Cisco Packet Tracer 8         |
