-- ========================================================
-- Smart Attendance Management System - Database Schema
-- Database: smart_attendance_college_db
-- ========================================================

CREATE DATABASE IF NOT EXISTS smart_attendance_college_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE smart_attendance_college_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    phone VARCHAR(50),
    avatar_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Classes Table
CREATE TABLE IF NOT EXISTS classes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    class_name VARCHAR(255) NOT NULL UNIQUE,
    department VARCHAR(255) NOT NULL,
    section VARCHAR(50),
    academic_year VARCHAR(50),
    total_capacity INT DEFAULT 60
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Faculty Table
CREATE TABLE IF NOT EXISTS faculty (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    faculty_code VARCHAR(100) NOT NULL UNIQUE,
    department VARCHAR(255),
    designation VARCHAR(255),
    office_room VARCHAR(100),
    CONSTRAINT fk_faculty_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Students Table
CREATE TABLE IF NOT EXISTS students (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    roll_number VARCHAR(100) NOT NULL UNIQUE,
    class_id BIGINT NOT NULL,
    department VARCHAR(255),
    semester INT,
    batch VARCHAR(50),
    CONSTRAINT fk_student_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_student_class FOREIGN KEY (class_id) REFERENCES classes(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Subjects Table
CREATE TABLE IF NOT EXISTS subjects (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    subject_code VARCHAR(100) NOT NULL UNIQUE,
    subject_name VARCHAR(255) NOT NULL,
    department VARCHAR(255),
    credits INT DEFAULT 4,
    faculty_id BIGINT,
    CONSTRAINT fk_subject_faculty FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Attendance Sessions Table
CREATE TABLE IF NOT EXISTS attendance_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_code VARCHAR(100) NOT NULL UNIQUE,
    qr_token VARCHAR(500) NOT NULL UNIQUE,
    faculty_id BIGINT NOT NULL,
    class_id BIGINT NOT NULL,
    subject_id BIGINT NOT NULL,
    session_date DATE NOT NULL,
    start_time TIMESTAMP NOT NULL,
    expiry_time TIMESTAMP NULL,
    duration_minutes INT DEFAULT 15,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    room_number VARCHAR(100) DEFAULT 'LH-301',
    CONSTRAINT fk_session_faculty FOREIGN KEY (faculty_id) REFERENCES faculty(id),
    CONSTRAINT fk_session_class FOREIGN KEY (class_id) REFERENCES classes(id),
    CONSTRAINT fk_session_subject FOREIGN KEY (subject_id) REFERENCES subjects(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Attendance Records Table
CREATE TABLE IF NOT EXISTS attendance_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    subject_id BIGINT NOT NULL,
    record_date DATE NOT NULL,
    record_time TIME NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PRESENT',
    method VARCHAR(50) NOT NULL DEFAULT 'QR_SCAN',
    verification_details VARCHAR(255),
    device_info VARCHAR(255),
    CONSTRAINT uk_session_student UNIQUE (session_id, student_id),
    CONSTRAINT fk_record_session FOREIGN KEY (session_id) REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    CONSTRAINT fk_record_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_record_subject FOREIGN KEY (subject_id) REFERENCES subjects(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Face Profiles Table (Privacy-Preserving Biometric Descriptors)
CREATE TABLE IF NOT EXISTS face_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL UNIQUE,
    consent_given BOOLEAN NOT NULL DEFAULT FALSE,
    consented_at TIMESTAMP NULL,
    face_descriptor_json TEXT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    enrolled_at TIMESTAMP NULL,
    confidence_threshold FLOAT DEFAULT 0.65,
    CONSTRAINT fk_face_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
