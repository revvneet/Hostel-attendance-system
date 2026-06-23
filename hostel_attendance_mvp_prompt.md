# Hostel Attendance Management System — Antigravity MVP Prompt

---

## Project Overview

Build a full-stack **Hostel Attendance Management System** using the **MERN stack** (MongoDB, Express.js, React, Node.js). The app is used by hostel wardens/admins to track daily student attendance across multiple floors and rooms. The UI should be clean, institutional, and highly functional — responsive and fluid across screen sizes.

---

## Tech Stack

| Layer      | Technology                         |
|------------|------------------------------------|
| Frontend   | React (Vite), React Router v6      |
| Styling    | Tailwind CSS                       |
| Backend    | Node.js + Express.js               |
| Database   | MongoDB (via Mongoose)             |
| File Store | Local `/uploads/photos/` directory |
| Auth       | JWT (JSON Web Tokens)              |
| HTTP       | Axios                              |

---

## File & Folder Structure

```
hostel-attendance/
│
├── client/                          # React frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── assets/                  # Static assets, icons
│   │   ├── components/              # Reusable UI components
│   │   │   ├── Navbar.jsx           # Top navigation bar
│   │   │   ├── RoomTile.jsx         # Individual room tile with student cards
│   │   │   ├── StudentCard.jsx      # Compact card showing student + status
│   │   │   ├── StudentModal.jsx     # Expanded student detail + mark attendance
│   │   │   ├── LeaveModal.jsx       # Leave registration (start date / end date)
│   │   │   ├── DateHistoryPanel.jsx # Sidebar panel listing past dates (View 6)
│   │   │   └── FloorTabs.jsx        # Floor selector tab bar
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx        # /login  — JWT login form
│   │   │   ├── HelpPage.jsx         # /help   — Developer + admin contact info
│   │   │   ├── Dashboard.jsx        # /dashboard — Main dynamic dashboard
│   │   │   └── ProfilePage.jsx      # /profile — Logged-in user profile
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Global auth state (JWT token, user info)
│   │   ├── hooks/
│   │   │   └── useAttendance.js     # Custom hook for attendance API calls
│   │   ├── utils/
│   │   │   └── api.js               # Axios base instance with auth headers
│   │   ├── App.jsx                  # Router setup, protected routes
│   │   └── main.jsx                 # Vite entry point
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                          # Express backend
│   ├── config/
│   │   └── db.js                    # MongoDB connection via Mongoose
│   ├── models/
│   │   ├── Student.js               # Student details schema
│   │   ├── Attendance.js            # Today's / current attendance schema
│   │   └── AttendanceHistory.js     # Historical attendance records schema
│   ├── routes/
│   │   ├── auth.routes.js           # POST /api/auth/login
│   │   ├── student.routes.js        # CRUD for students, photo upload
│   │   ├── attendance.routes.js     # Mark present/absent/leave, get today's
│   │   └── history.routes.js        # GET attendance by date
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── student.controller.js
│   │   ├── attendance.controller.js
│   │   └── history.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js       # JWT verification middleware
│   │   └── upload.middleware.js     # Multer config for photo uploads
│   ├── uploads/
│   │   └── photos/                  # Local storage for student passport photos
│   ├── utils/
│   │   └── seedData.js              # Optional: seed script for dev testing
│   ├── .env                         # PORT, MONGO_URI, JWT_SECRET
│   └── server.js                    # Express app entry point
│
├── .gitignore
└── README.md
```

---

## MongoDB Schemas

### 1. `Student` — `/server/models/Student.js`
Stores permanent student profile information.

```js
{
  _id: ObjectId,
  name: String,                    // Full name
  enrollmentNo: String,            // Unique enrollment / roll number
  phoneNo: String,
  parentPhone: String,
  floor: Number,                   // 1–4
  roomNo: String,                  // e.g. "101", "203"
  roomType: String,                // "sharing" | "single"
  bed: String,                     // "A" | "B" | "C" | "D" (max 4 per room)
  photoPath: String,               // Relative path: "uploads/photos/abc123.jpg"
  createdAt: Date
}
```

### 2. `Attendance` — `/server/models/Attendance.js`
Tracks the **current day's** attendance record per student. One document per student per day.

```js
{
  _id: ObjectId,
  studentId: ObjectId,             // ref: 'Student'
  date: Date,                      // Date only (no time), e.g. 2026-06-23
  status: String,                  // "present" | "absent" | "leave"
  leaveStart: Date,                // Set only if status is "leave"
  leaveEnd: Date,                  // Set only if status is "leave"
  markedAt: Date                   // Timestamp of last status change
}
```

**Default behaviour:** When the dashboard loads for a new day, if no Attendance document exists for a student for that date, treat their status as `"absent"` (do NOT pre-create documents — create them on first mark action).

### 3. `AttendanceHistory` — `/server/models/AttendanceHistory.js`
A snapshot copy of attendance once the day is closed, for historical lookup. **Identical schema to `Attendance`** but never mutated after creation. This is populated by a scheduled save (nightly cron or on-demand archive endpoint).

```js
{
  _id: ObjectId,
  studentId: ObjectId,             // ref: 'Student'
  date: Date,
  status: String,                  // "present" | "absent" | "leave"
  leaveStart: Date,
  leaveEnd: Date,
  archivedAt: Date
}
```

---

## Backend API Endpoints

### Auth — `POST /api/auth/login`
- Body: `{ username, password }`
- Returns: `{ token, user: { name, role } }`

### Students — `/api/students`
| Method | Path                          | Description                           |
|--------|-------------------------------|---------------------------------------|
| GET    | `/api/students`               | All students (supports `?floor=&room=&name=` filters) |
| GET    | `/api/students/:id`           | Single student detail                 |
| POST   | `/api/students`               | Create new student (multipart for photo) |
| PUT    | `/api/students/:id`           | Update student info                   |
| DELETE | `/api/students/:id`           | Remove student                        |

### Attendance — `/api/attendance`
| Method | Path                              | Description                                             |
|--------|-----------------------------------|---------------------------------------------------------|
| GET    | `/api/attendance?date=YYYY-MM-DD` | All students with their status for that date, grouped by floor → room |
| PATCH  | `/api/attendance/:studentId`      | Mark status. Body: `{ status, leaveStart?, leaveEnd? }` |

### History — `/api/history`
| Method | Path                              | Description                                  |
|--------|-----------------------------------|----------------------------------------------|
| GET    | `/api/history/dates`              | List of all unique dates with saved history  |
| GET    | `/api/history?date=YYYY-MM-DD`    | Full attendance snapshot for a past date     |
| POST   | `/api/history/archive`            | Archive today's attendance into history (call at end of day) |

### Static files
```
GET /uploads/photos/:filename   → serve passport photo images
```

---

## Frontend Pages & Views

---

### Page 1: `/login` — Login Page

**Layout:** Centered card on a neutral background. App name ("Hostel Attendance") at top with institution logo placeholder.

**Elements:**
- Username input field
- Password input field (with show/hide toggle)
- Login button
- On error: inline error message ("Invalid credentials")
- On success: redirect to `/dashboard`

**Auth:** Store the returned JWT in `localStorage` via `AuthContext`. All subsequent API calls attach `Authorization: Bearer <token>` header.

---

### Page 2: `/help` — Help Page

**Layout:** Two contact cards side by side (stack on mobile).

**Elements:**
- **Developers card:** Email, Phone, "Call" button (tel: link)
- **College Admin card:** Email, Phone, "Call" button (tel: link)
- Back arrow or navbar to return to dashboard

---

### Page 3–7: `/dashboard` — Main Dynamic Dashboard

This is the core of the application. It has **5 views** that are rendered conditionally within the same page — no full navigation happens between them.

---

#### View 3 (Default): Main Dashboard

**Top Bar (Navbar):**
- Left: Calendar icon button → toggles to View 6 (Date History)
- Center: Search bar (searches by student name OR room number, real-time filter)
- Right: "Absentees" filter toggle button | Institution logo | Auth menu

**Floor Tabs:**
- Horizontal tabs: `Floor 1 | Floor 2 | Floor 3 | Floor 4`
- Clicking a tab renders only the rooms belonging to that floor
- The active tab is visually highlighted

**Room Grid:**
- Rooms are fetched from the database grouped by floor
- Each floor renders a responsive grid of **Room Tiles**
- Rooms of type `"sharing"` and `"single"` are rendered in **two visually separated sections** within the same floor tab — sharing rooms first, then a labelled divider, then single rooms (View 7 shows this clearly)

**Room Tile (`RoomTile.jsx`):**
- Displays: Room number label (e.g. "101") at top
- Contains up to 4 `StudentCard` components (one per bed)
- Empty beds show a faint empty-card placeholder
- **Tile background:** Red-tinted (`bg-red-100 border-red-400`) if **any** student in that room has status `"absent"`. Green-tinted (`bg-green-100 border-green-400`) if all are present. Leave students count as non-absent for tile color purposes.
- Tile is clickable only via the individual student cards inside it, not the tile itself

**Student Card (`StudentCard.jsx`):**
- Shows: Circular passport photo (or fallback avatar), student name (truncated), status badge
- Status badge colors:
  - `absent` → red badge
  - `present` → green badge
  - `leave` → yellow/amber badge
- Clicking the card opens **View 4** (Student Modal) as an overlay

**Absentees Filter:**
When toggled, only rooms containing at least one absent student are shown, and within those rooms, only absent student cards are highlighted (others remain visible but dimmed).

**Search:**
- Real-time filter on the currently active floor tab
- Matches against: student name (partial, case-insensitive) OR room number (exact or partial match)
- Clears to show all rooms when search is empty

---

#### View 4: Student Card Expanded (Modal Overlay)

Triggered by clicking a Student Card. Renders as a centered modal with a dimmed backdrop.

**Layout:**
- Large circular photo (passport photo fetched from `/uploads/photos/`)
- Student details:
  - Name
  - Enrollment No
  - Phone No
  - Parent's Phone
  - Bed (A / B / C / D)
  - Current Status badge
- **Action buttons (right side):**
  - `Mark Present` → sets status to `"present"`, closes modal
  - `Leave` → opens **View 5** (Leave Modal) on top of this modal
  - Current status defaults to `absent` if no record exists for today

**Behaviour:**
- Clicking outside the modal or pressing Escape closes it
- After marking, the Student Card on the dashboard updates reactively without full page reload

---

#### View 5: Register Leave (Modal Overlay — stacked on View 4)

Triggered by clicking "Leave" in View 4.

**Layout:**
- Leave form displayed alongside student details (same student info panel visible)
- Start Date picker
- End Date picker
- Confirm / Submit button → sets status to `"leave"` with the date range, closes both modals
- Cancel button → returns to View 4

**Validation:**
- End date must be on or after start date
- Both dates are required before submission

---

#### View 6: Date Expanded (History View)

Triggered by clicking the Calendar icon in the top-left of the navbar.

**Layout:**
- Left panel: Scrollable list of dates that have saved history (fetched from `/api/history/dates`)
  - Format: `DD Mon YYYY` (e.g. "19 Feb 2026")
  - Clicking a date loads the attendance snapshot for that date
- Right panel: Same room-grid layout as View 3, but rendered from **historical data** (read-only — no mark buttons)
  - Tiles and cards show status colors exactly as they were on that date
- Clicking the Calendar icon again (or a back arrow) returns to View 3

---

#### View 7: Single / Sharing Boundary (Within View 3)

This is **not a separate view toggle** — it is simply how rooms are laid out within each floor tab in View 3:

```
[ Floor Tab ]
  ┌─ Sharing Rooms ──────────────────────────────┐
  │  [Room 101]  [Room 102]  [Room 103]  ...     │
  └──────────────────────────────────────────────┘
  ━━━━━━━━━━━━━━ Single Rooms ━━━━━━━━━━━━━━━━━━
  ┌──────────────────────────────────────────────┐
  │  [Room 201]  [Room 202]  ...                 │
  └──────────────────────────────────────────────┘
```

- The divider label "Single Rooms" is rendered between the two groups
- Both types use the same Room Tile component; the label is purely presentational

---

### Page 8: `/profile` — Profile Page

**MVP Scope (minimal):**
- Displays the logged-in warden's name and role
- Change password form (current password → new password → confirm)
- Logout button (clears JWT, redirects to `/login`)

---

## Key React Implementation Details

### State Management
- Use `React Context + useReducer` for auth state globally
- Use component-level `useState` + `useEffect` + Axios for dashboard data
- Dashboard data re-fetches when: floor tab changes, date changes in history view, or a student status is marked

### Real-time Updates (MVP approach)
- After marking attendance, **optimistically update** local state immediately (show new status), then confirm via API response. If API fails, revert.
- No WebSocket needed for MVP — polling or manual refresh is acceptable.

### Protected Routes
- Wrap `/dashboard` and `/profile` in a `<ProtectedRoute>` component that checks for a valid JWT in `AuthContext`. Redirect to `/login` if unauthenticated.

### Photo Display
- Photos served statically by Express from `/server/uploads/photos/`
- Frontend references: `http://localhost:5000/uploads/photos/${student.photoPath.split('/').pop()}`
- Fallback: grey avatar SVG if `photoPath` is null or image fails to load

### Room Tile Color Logic (in `RoomTile.jsx`)
```js
const isAnyAbsent = students.some(s => s.status === 'absent' || !s.status);
// Apply red tint class if isAnyAbsent, green tint if all present/leave
```

---

## Backend Implementation Details

### `server.js` — Entry Point
```js
// Load env, connect to MongoDB, mount routes, serve static /uploads, start server
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/auth', authRoutes);
app.use('/api/students', authMiddleware, studentRoutes);
app.use('/api/attendance', authMiddleware, attendanceRoutes);
app.use('/api/history', authMiddleware, historyRoutes);
```

### Photo Upload (Multer)
- Field name: `photo`
- Dest: `server/uploads/photos/`
- Filename: `Date.now() + '_' + originalname` (sanitized)
- Max size: 2MB, accepted MIME: `image/jpeg`, `image/png`

### Attendance Logic (in `attendance.controller.js`)
```
GET /api/attendance?date=YYYY-MM-DD:
  1. Fetch all students
  2. Fetch all Attendance records for the given date
  3. Merge: for each student, attach their attendance record (or default status "absent")
  4. Group by floor → room, return structured JSON

PATCH /api/attendance/:studentId:
  1. Find-or-create attendance record for (studentId, today)
  2. Update status + leaveStart/leaveEnd
  3. Return updated record
```

### History Archive Endpoint (`POST /api/history/archive`)
```
1. Get today's date
2. Fetch all Attendance records for today
3. For all students with no record today, generate an "absent" entry
4. Bulk-insert into AttendanceHistory collection
5. Return count of archived records
```
> Call this manually or via a daily cron (node-cron) at midnight.

---

## Environment Variables (`.env`)

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/hostel_attendance
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d
```

---

## Seed Data (for development)

Create `server/utils/seedData.js` with:
- 1 admin user (username: `admin`, password: `hostel123`)
- 4 floors
- Floor 1: 20 rooms (rooms 101–120, 16 sharing / 4 single)
- Floor 2: 15 rooms (rooms 201–215, 12 sharing / 3 single)
- Floor 3: 18 rooms (rooms 301–318, 14 sharing / 4 single)
- Floor 4: 12 rooms (rooms 401–412, 10 sharing / 2 single)
- 2–4 students per sharing room, 1 per single room
- All with placeholder photo paths pointing to a default `avatar.jpg`

Run with: `node server/utils/seedData.js`

---

## UI Design Direction

- **Color palette:** White/off-white backgrounds, deep navy (`#1a2744`) for navbar/headers, green (`#22c55e`) for present, red (`#ef4444`) for absent, amber (`#f59e0b`) for leave.
- **Typography:** Inter or DM Sans — clean, institutional, readable at small sizes.
- **Tile layout:** CSS Grid with `auto-fill` columns, min tile width ~160px. Room tiles have a border, subtle shadow, and rounded corners.
- **Modals:** Centered, with a semi-transparent dark overlay. Smooth fade-in animation.
- **Responsiveness:** Dashboard collapses floor tabs to a scrollable horizontal bar on mobile. Room grid adapts to 2 columns on tablet, 1 on small mobile.
- **Loading states:** Skeleton tiles while fetching floor data. Spinner on modal submit.

