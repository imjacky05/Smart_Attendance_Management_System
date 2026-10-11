package com.college.attendance.service;

import com.college.attendance.model.*;
import com.college.attendance.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final FacultyRepository facultyRepository;
    private final StudentRepository studentRepository;
    private final CollegeClassRepository collegeClassRepository;
    private final SubjectRepository subjectRepository;
    private final AttendanceSessionRepository sessionRepository;
    private final AttendanceRecordRepository recordRepository;
    private final FaceProfileRepository faceProfileRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           FacultyRepository facultyRepository,
                           StudentRepository studentRepository,
                           CollegeClassRepository collegeClassRepository,
                           SubjectRepository subjectRepository,
                           AttendanceSessionRepository sessionRepository,
                           AttendanceRecordRepository recordRepository,
                           FaceProfileRepository faceProfileRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.facultyRepository = facultyRepository;
        this.studentRepository = studentRepository;
        this.collegeClassRepository = collegeClassRepository;
        this.subjectRepository = subjectRepository;
        this.sessionRepository = sessionRepository;
        this.recordRepository = recordRepository;
        this.faceProfileRepository = faceProfileRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            return; // Data already exists
        }

        System.out.println(">>> Initializing sample data for Smart Attendance Management System...");

        // 1. Classes
        CollegeClass cse3A = new CollegeClass("B.Tech CSE - 3rd Year", "Computer Science", "Section A", "2025-2026");
        CollegeClass it3B = new CollegeClass("B.Tech IT - 3rd Year", "Information Technology", "Section B", "2025-2026");
        CollegeClass aids2A = new CollegeClass("B.Tech AI & Data Science - 2nd Year", "Artificial Intelligence", "Section A", "2025-2026");
        collegeClassRepository.saveAll(Arrays.asList(cse3A, it3B, aids2A));

        // 2. Faculty Users
        User facUser1 = new User("faculty@college.edu", passwordEncoder.encode("faculty123"), "Dr. Robert Miller", Role.FACULTY, "+1-555-0101");
        User facUser2 = new User("sarah.jenkins@college.edu", passwordEncoder.encode("faculty123"), "Prof. Sarah Jenkins", Role.FACULTY, "+1-555-0102");
        userRepository.saveAll(Arrays.asList(facUser1, facUser2));

        Faculty fac1 = new Faculty(facUser1, "FAC-CSE-101", "Computer Science", "Professor & HOD", "Cabin A-204");
        Faculty fac2 = new Faculty(facUser2, "FAC-IT-102", "Information Technology", "Associate Professor", "Cabin B-105");
        facultyRepository.saveAll(Arrays.asList(fac1, fac2));

        // 3. Subjects
        Subject dbms = new Subject("CS501", "Database Management Systems", "Computer Science", 4, fac1);
        Subject os = new Subject("CS502", "Operating Systems", "Computer Science", 4, fac1);
        Subject web = new Subject("CS503", "Full Stack Web Development", "Computer Science", 3, fac1);
        Subject networks = new Subject("IT501", "Computer Networks & Security", "Information Technology", 4, fac2);
        subjectRepository.saveAll(Arrays.asList(dbms, os, web, networks));

        // 4. Student Users & Profiles
        User stuUser1 = new User("student@college.edu", passwordEncoder.encode("student123"), "Alex Johnson", Role.STUDENT, "+1-555-0201");
        User stuUser2 = new User("emily.davis@college.edu", passwordEncoder.encode("student123"), "Emily Davis", Role.STUDENT, "+1-555-0202");
        User stuUser3 = new User("michael.chen@college.edu", passwordEncoder.encode("student123"), "Michael Chen", Role.STUDENT, "+1-555-0203");
        User stuUser4 = new User("jessica.taylor@college.edu", passwordEncoder.encode("student123"), "Jessica Taylor", Role.STUDENT, "+1-555-0204");
        User stuUser5 = new User("david.smith@college.edu", passwordEncoder.encode("student123"), "David Smith", Role.STUDENT, "+1-555-0205");
        userRepository.saveAll(Arrays.asList(stuUser1, stuUser2, stuUser3, stuUser4, stuUser5));

        Student stu1 = new Student(stuUser1, "CS202301", cse3A, "Computer Science", 6, "2023-2027");
        Student stu2 = new Student(stuUser2, "CS202302", cse3A, "Computer Science", 6, "2023-2027");
        Student stu3 = new Student(stuUser3, "CS202303", cse3A, "Computer Science", 6, "2023-2027");
        Student stu4 = new Student(stuUser4, "IT202301", it3B, "Information Technology", 6, "2023-2027");
        Student stu5 = new Student(stuUser5, "IT202302", it3B, "Information Technology", 6, "2023-2027");
        studentRepository.saveAll(Arrays.asList(stu1, stu2, stu3, stu4, stu5));

        // Pre-consent one student for Face Recognition demo
        FaceProfile fp1 = new FaceProfile(stu1, true, LocalDateTime.now().minusDays(5), null, "PENDING", null);
        faceProfileRepository.save(fp1);

        // 5. Initial Sessions (One Active, One Past)
        LocalDate today = LocalDate.now();
        AttendanceSession pastSession = new AttendanceSession(
                "SES-" + today.minusDays(1).toString().replace("-", "") + "-CS501-A1",
                "ATT-" + UUID.randomUUID().toString(),
                fac1,
                cse3A,
                dbms,
                today.minusDays(1),
                LocalDateTime.now().minusDays(1).withHour(10).withMinute(0),
                LocalDateTime.now().minusDays(1).withHour(10).withMinute(30),
                30,
                "CLOSED",
                "LH-301"
        );

        AttendanceSession activeSession = new AttendanceSession(
                "SES-" + today.toString().replace("-", "") + "-CS501-A2",
                "ATT-ACTIVE-DEMO-TOKEN-2026",
                fac1,
                cse3A,
                dbms,
                today,
                LocalDateTime.now().minusMinutes(5),
                LocalDateTime.now().plusMinutes(25),
                30,
                "ACTIVE",
                "LH-301"
        );
        sessionRepository.saveAll(Arrays.asList(pastSession, activeSession));

        // 6. Sample Attendance Records
        AttendanceRecord r1 = new AttendanceRecord(
                pastSession,
                stu1,
                dbms,
                today.minusDays(1),
                LocalTime.of(10, 5),
                "PRESENT",
                "QR_SCAN",
                "Scanned via Mobile Camera",
                "Chrome Mobile / Android"
        );
        AttendanceRecord r2 = new AttendanceRecord(
                pastSession,
                stu2,
                dbms,
                today.minusDays(1),
                LocalTime.of(10, 8),
                "PRESENT",
                "QR_SCAN",
                "Scanned via Mobile Camera",
                "Safari / iOS"
        );
        AttendanceRecord r3 = new AttendanceRecord(
                pastSession,
                stu3,
                dbms,
                today.minusDays(1),
                LocalTime.of(10, 15),
                "PRESENT",
                "FACE_RECOGNITION",
                "Biometric Face Match Verified (96.2%)",
                "Kiosk Camera"
        );

        // Record on today's active session for stu2 so stu1 can test scanning live!
        AttendanceRecord rToday = new AttendanceRecord(
                activeSession,
                stu2,
                dbms,
                today,
                LocalTime.now().minusMinutes(2),
                "PRESENT",
                "QR_SCAN",
                "Scanned via Mobile Camera",
                "Chrome Web Browser"
        );

        recordRepository.saveAll(Arrays.asList(r1, r2, r3, rToday));

        System.out.println(">>> Sample data successfully initialized!");
        System.out.println(">>> Faculty credentials: faculty@college.edu / faculty123");
        System.out.println(">>> Student credentials: student@college.edu / student123");
    }
}
