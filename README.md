# Hostel Attendance Management System

A full-stack MERN application for hostel wardens to track daily student attendance across multiple floors and rooms.

## Tech Stack
- **Frontend:** React (Vite), React Router v6, Tailwind CSS, Axios
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT (JSON Web Tokens)

## Quick Start

### Prerequisites
- Node.js >= 18
- MongoDB running locally on port 27017

### 1. Install Dependencies

```bash
# Backend
cd server && npm install

# Frontend
cd client && npm install
```

### 2. Seed the Database

```bash
cd server
node utils/seedData.js
```

This creates:
- Admin user: `admin` / `hostel123`
- 163 students across 4 floors

### 3. Start the Servers

**Terminal 1 – Backend (port 5001):**
```bash
cd server && npm run dev
```

**Terminal 2 – Frontend (port 5173):**
```bash
cd client && npm run dev
```

### 4. Open the App

Navigate to **http://localhost:5173** and log in with `admin` / `hostel123`.

---

## Features

| View | Description |
|------|-------------|
| Login | JWT authentication with show/hide password |
| Dashboard (View 3) | Floor tabs, room grid, search, absentees filter |
| Student Modal (View 4) | Full student details, mark present/absent |
| Leave Modal (View 5) | Register leave with date range |
| History View (View 6) | Browse archived attendance by date |
| Profile (/profile) | Change password, logout |
| Help (/help) | Developer & admin contact cards |

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | No | Login |
| POST | `/api/auth/change-password` | Yes | Change password |
| GET | `/api/students` | Yes | List students |
| GET | `/api/attendance?date=` | Yes | Attendance for date |
| PATCH | `/api/attendance/:studentId` | Yes | Mark attendance |
| GET | `/api/history/dates` | Yes | List archived dates |
| GET | `/api/history?date=` | Yes | Snapshot for date |
| POST | `/api/history/archive` | Yes | Archive today |

## Environment Variables

Create `server/.env`:
```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/hostel_attendance
JWT_SECRET=hostel_super_secret_2026
JWT_EXPIRES_IN=7d
```
