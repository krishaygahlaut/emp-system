# EmpDesk — Employee Management System

A full-stack Employee Management System built with React, Node.js, Express, and MongoDB. Built as a 2-day internship assessment project.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript, Vite, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (stored in localStorage) |
| Charts | Recharts |
| UI | lucide-react, react-hot-toast |

## Features

- **Auth** — Admin login with JWT, protected routes, persistent sessions
- **Employees** — Full CRUD, search/filter by name/email/department/status, auto-generated IDs (EMP-0001)
- **Attendance** — Mark present/absent/half-day per employee per day, check-in/out times
- **Leave Management** — Apply leave, approve/reject, leave history with status badges
- **Schedules** — Assign shifts (Morning/Afternoon/Night/Flexible) with auto-filled times
- **Dashboard & Reports** — Monthly charts (bar + pie), stats overview via Recharts

## Project Structure

```
emp-system/
├── backend/
│   ├── src/
│   │   ├── controllers/    # authController, employeeController, etc.
│   │   ├── middleware/     # auth.js (JWT verification)
│   │   ├── models/         # Admin, Employee, Attendance, Leave, Schedule
│   │   └── routes/         # auth, employees, attendance, leaves, schedules, reports
│   ├── seed.js             # seed admin + 8 sample employees
│   └── .env.example
└── frontend/
    └── src/
        ├── components/     # Modal
        ├── context/        # AuthContext
        ├── layouts/        # AppLayout (sidebar)
        ├── pages/          # Dashboard, Employees, Attendance, Leaves, Schedules, Reports
        ├── routes/         # ProtectedRoute
        ├── services/       # axios instance with interceptors
        └── types/          # TypeScript interfaces
```

## Setup

### Prerequisites

- Node.js 18+
- MongoDB running locally (or a MongoDB Atlas URI)

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env — set MONGO_URI and JWT_SECRET
npm install
node seed.js       # seed admin + sample data (optional but recommended)
npm run dev        # runs on port 5000
```

### Frontend

```bash
cd frontend
cp .env.example .env
# VITE_API_URL=http://localhost:5000/api (default)
npm install
npm run dev        # runs on port 5173
```

### Environment Variables

**backend/.env**
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/emp-management
JWT_SECRET=change_this_to_something_secret
CLIENT_URL=http://localhost:5173
```

**frontend/.env**
```
VITE_API_URL=http://localhost:5000/api
```

## Default Login

```
Email:    admin@company.com
Password: admin123
```

> The admin is auto-seeded on first server start if none exists.

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Admin login |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/employees` | List employees (supports `search`, `department`, `status` query params) |
| POST | `/api/employees` | Add employee |
| PUT | `/api/employees/:id` | Update employee |
| DELETE | `/api/employees/:id` | Delete employee |
| POST | `/api/attendance` | Mark attendance (upsert per employee/day) |
| GET | `/api/attendance` | Get records (supports `date`, `month`, `year`, `employeeId`) |
| POST | `/api/leaves` | Apply leave |
| GET | `/api/leaves` | Get leaves (supports `status`, `employeeId`) |
| PUT | `/api/leaves/:id/status` | Approve or reject leave |
| POST | `/api/schedules` | Assign shift |
| GET | `/api/schedules` | Get schedules |
| GET | `/api/reports/monthly` | Monthly report (supports `month`, `year`) |

## Database Schema

**Employee** — `name, email, phone, department, position, joiningDate, status, employeeId`

**Attendance** — `employee (ref), date, status (Present/Absent/Half-day), checkIn, checkOut, notes` — unique index on `(employee, date)`

**Leave** — `employee (ref), type, startDate, endDate, reason, status (Pending/Approved/Rejected), reviewNote`

**Schedule** — `employee (ref), shift, startTime, endTime, date, notes`

**Admin** — `name, email, password (bcrypt hashed), role`
