# 🎓 Smart Attendance Management System

A complete, modern, responsive web application for college attendance management featuring real-time QR code generation and camera scanning, privacy-preserving biometric face recognition, role-based dashboards, and multi-factor reporting with CSV exports.

---

## 🏛️ System Architecture & Technology Stack

- **Frontend**: React 18, Vite, JavaScript, CSS3, Lucide Icons, `html5-qrcode` (camera scanner), `qrcode.react` (high-res SVG QR generator).
- **Backend**: Java 21, Spring Boot 3.3.4 (REST API, Spring Security, Spring Data JPA, Jakarta Bean Validation, JJWT 0.12.5).
- **Database**: MySQL 8.0 (`smart_attendance_college_db`).
- **Security**: BCrypt password hashing, stateless JWT Bearer token authentication, role-based permission enforcement (`FACULTY`, `STUDENT`, `ADMIN`), duplicate scan prevention.
- **Biometrics (Face Recognition)**: Privacy-first client-side 128-dimensional facial landmark feature extraction, informed consent tracking, cosine similarity verification, **zero raw photo retention**.

---

## 📁 Project Structure

```
collage/
├── backend/
│   ├── pom.xml                                       # Maven build configuration
│   └── src/
│       ├── main/
│       │   ├── java/com/college/attendance/
│       │   │   ├── SmartAttendanceApplication.java    # Spring Boot entry point
│       │   │   ├── controller/                        # REST Controllers
│       │   │   │   ├── AuthController.java            # Login & demo account endpoints
│       │   │   │   ├── FacultyController.java         # Stats, sessions & scanned lists
│       │   │   │   ├── StudentController.java         # Profile, QR scanner & history
│       │   │   │   ├── FaceRecognitionController.java # Consent, enroll & verify
│       │   │   │   └── ReportController.java          # Multi-filter reports & CSV export
│       │   │   ├── dto/                               # Request & response data models
│       │   │   ├── exception/                         # Global error handling
│       │   │   ├── model/                             # JPA Entities (8 Tables)
│       │   │   ├── repository/                        # Spring Data JPA Repositories
│       │   │   ├── security/                          # JWT filter & Spring Security
│       │   │   └── service/                           # Business logic & DataInitializer
│       │   └── resources/
│       │       ├── application.properties             # Active database configuration
│       │       ├── application.example.properties     # Config template for deployment
│       │       ├── schema.sql                         # MySQL DDL table schemas
│       │       └── data.sql                           # Seed notes
│       └── test/
├── frontend/
│   ├── package.json                                   # NPM dependencies
│   ├── vite.config.js                                 # Vite config with /api reverse proxy
│   ├── index.html                                     # Web entry page
│   └── src/
│       ├── api/                                       # API client & fetch modules
│       ├── context/                                   # AuthContext & session state
│       ├── components/                                # Reusable UI components
│       │   ├── Sidebar.jsx                            # Role-based sidebar navigation
│       │   ├── Topbar.jsx                             # Header with live quick account switch
│       │   ├── StatCard.jsx                           # KPI metric card
│       │   ├── QrSessionView.jsx                      # QR code generator & live attendee feed
│       │   ├── QrScannerView.jsx                      # Camera QR scanner & duplicate alert
│       │   ├── FaceRecognitionView.jsx                # Biometric consent, enroll & verify
│       │   └── ReportView.jsx                         # Multi-filter reports & CSV export
│       ├── pages/                                     # Page views
│       │   ├── LoginPage.jsx                          # Role-based login with demo buttons
│       │   ├── FacultyDashboardPage.jsx               # Faculty command center
│       │   └── StudentDashboardPage.jsx               # Student profile & history
│       ├── index.css                                  # Blue & White College Dashboard CSS
│       ├── App.jsx                                    # Router & view controller
│       └── main.jsx                                   # React DOM root
└── README.md
```

---

## 🔑 Default Test Accounts (Pre-Seeded)

The system automatically initializes test accounts upon first startup:

| Role | Email | Password | Name | Department / Roll No |
|---|---|---|---|---|
| **Faculty** | `faculty@college.edu` | `faculty123` | Dr. Robert Miller | Dept: Computer Science (`FAC-CSE-101`) |
| **Faculty 2** | `sarah.jenkins@college.edu` | `faculty123` | Prof. Sarah Jenkins | Dept: Information Technology (`FAC-IT-102`) |
| **Student** | `student@college.edu` | `student123` | Alex Johnson | Roll No: `CS202301` (B.Tech CSE - 3rd Year) |
| **Student 2** | `emily.davis@college.edu` | `student123` | Emily Davis | Roll No: `CS202302` (B.Tech CSE - 3rd Year) |
| **Student 3** | `michael.chen@college.edu` | `student123` | Michael Chen | Roll No: `CS202303` (B.Tech CSE - 3rd Year) |

> 💡 **Tip:** New users can directly register as either **Student** or **Faculty** using the **"Register"** tab on the Login page.

---

## 🚀 Setup & Execution Guide

### Prerequisites
- **Java**: JDK 21+ (`java -version`)
- **Maven**: 3.8+ (`mvn -version`)
- **Node.js**: v18+ or v20+ (`node -v`)
- **MySQL Server**: 8.0+ running on port 3306

---

### Step 1: Database Setup (MySQL)
1. Ensure your local MySQL service is running.
2. Create the database:
   ```sql
   CREATE DATABASE IF NOT EXISTS smart_attendance_college_db
     CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. Inspect or update `backend/src/main/resources/application.properties` with your MySQL credentials:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/smart_attendance_college_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
   spring.datasource.username=root
   spring.datasource.password=Your_MySQL_Password
   ```

*(An `application.example.properties` file is also provided in the same directory for reference).*

---

### Step 2: Run the Spring Boot Backend

Open a terminal in the project root:

```bash
cd backend
mvn clean compile
mvn spring-boot:run
```

- Backend REST API will start at: **`http://localhost:8080`**
- All 8 database tables are created and seeded with sample classes, subjects, faculty, students, and attendance sessions.

---

### Step 3: Run the React Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

- Vite dev server will start at: **`http://localhost:5173`**
- Open `http://localhost:5173` in any modern web browser.

---

## 🎯 Key Feature Walkthrough

### 1. Faculty Attendance Session & Live QR Code
1. Log in as **Faculty** (`faculty@college.edu` / `faculty123`).
2. Navigate to **"Generate QR Session"**.
3. Select a subject (e.g., *CS501: Database Management Systems*), a class (e.g., *B.Tech CSE - 3rd Year*), and validity duration (e.g., 15 minutes).
4. Click **"Generate Live Attendance QR Code"**.
5. The high-resolution QR code appears with an active countdown timer.
6. The **"Live Attendees Ticker"** automatically syncs every 3 seconds, showing students appear in real time as they scan!

### 2. Student QR Scanner with Camera & Duplicate Prevention
1. In another browser window or tab, log in as **Student** (`student@college.edu` / `student123`).
2. Go to **"Scan Faculty QR"**.
3. Click **"Start Camera"** to activate your webcam/mobile camera and aim at the QR code. *(Alternatively, paste the session QR token into the manual entry box)*.
4. The system validates session expiry and records attendance.
5. A confirmation badge appears displaying:
   - Subject code & name
   - Session code & timestamp
   - Status: **PRESENT**
6. **Duplicate Prevention Test**: Try scanning the exact same QR code a second time with the same student account. The system immediately catches the conflict and displays:
   `Duplicate Attendance Warning: You have already marked attendance for this session!`

### 3. Privacy-Preserving Face Recognition Module
1. Navigate to **"Face Recognition"** in the sidebar.
2. **Informed Consent**: Read the biometric privacy notice (explaining that zero raw photos are uploaded or retained) and click **"Grant Biometric Consent"**.
3. **Enrollment**: Switch to **"Biometric Enrollment"**, position your face inside the oval guide, and click **"Capture & Enroll Face Descriptor"**. The system extracts 128 normalized landmark vectors and saves them to the database.
4. **Verification**: Switch to **"Live Face Attendance"**, select an active lecture session, and click **"Verify Face & Mark Present"**. The system matches the live vector with the enrolled template using cosine similarity and marks verified attendance.

### 4. Multi-Factor Reports & CSV Export
1. Click **"Attendance Reports"** in the sidebar.
2. Filter attendance dynamically by:
   - **Student**: Filter by a specific roll number or all students
   - **Subject**: CS501, CS502, CS503, IT501
   - **Class**: B.Tech CSE, B.Tech IT, B.Tech AI & DS
   - **Status**: PRESENT, ABSENT, or LATE
   - **Date Range**: From Date to To Date
3. Inspect instant summary KPI cards (Total Records, Present Count, Absent Count, Attendance Rate %).
4. Review the **Subject-Wise Attendance Distribution** progress bars.
5. Click **"Export CSV Report"** to download a formatted college attendance spreadsheet (`.csv`) with full student, subject, faculty, timestamp, and verification method records.

---

## 🛡️ Database Schema Overview (8 Tables)

1. `users` — Base authentication credentials with encrypted passwords and roles.
2. `faculty` — Faculty profiles, department, designation, cabin room.
3. `classes` — College academic classes and sections.
4. `students` — Student roll numbers, enrolled classes, semester, batch.
5. `subjects` — Academic courses and assigned faculty instructors.
6. `attendance_sessions` — Active and past lecture sessions, unique QR tokens, duration, status.
7. `attendance_records` — Verified lecture attendances with unique constraint on `(session_id, student_id)` to prevent duplicates.
8. `face_profiles` — Biometric 128-D descriptor vectors, informed consent logs, and status.
