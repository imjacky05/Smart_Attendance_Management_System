package com.college.attendance.service;

import com.college.attendance.dto.AuthResponse;
import com.college.attendance.dto.LoginRequest;
import com.college.attendance.exception.AppException;
import com.college.attendance.model.Faculty;
import com.college.attendance.model.Role;
import com.college.attendance.model.Student;
import com.college.attendance.model.User;
import com.college.attendance.repository.CollegeClassRepository;
import com.college.attendance.repository.FacultyRepository;
import com.college.attendance.repository.StudentRepository;
import com.college.attendance.repository.UserRepository;
import com.college.attendance.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final FacultyRepository facultyRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    private final CollegeClassRepository collegeClassRepository;

    public AuthService(UserRepository userRepository,
                       FacultyRepository facultyRepository,
                       StudentRepository studentRepository,
                       CollegeClassRepository collegeClassRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.facultyRepository = facultyRepository;
        this.studentRepository = studentRepository;
        this.collegeClassRepository = collegeClassRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public AuthResponse register(com.college.attendance.dto.RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new AppException("Email already exists: " + email, HttpStatus.CONFLICT);
        }

        Role role = request.getRole() != null ? request.getRole() : Role.STUDENT;

        User user = new User(
                email,
                passwordEncoder.encode(request.getPassword()),
                request.getFullName().trim(),
                role,
                request.getPhone()
        );
        User savedUser = userRepository.save(user);

        Long specificId = null;
        String codeOrRoll = null;
        String department = request.getDepartment();
        String className = null;

        if (role == Role.STUDENT) {
            String roll = request.getRollNumber() != null ? request.getRollNumber().trim() : ("STU-" + savedUser.getId());
            if (studentRepository.findByRollNumber(roll).isPresent()) {
                throw new AppException("Roll number already registered: " + roll, HttpStatus.CONFLICT);
            }

            com.college.attendance.model.CollegeClass collegeClass = null;
            if (request.getClassId() != null) {
                collegeClass = collegeClassRepository.findById(request.getClassId()).orElse(null);
            }
            if (collegeClass == null) {
                collegeClass = collegeClassRepository.findAll().stream().findFirst().orElseGet(() -> {
                    com.college.attendance.model.CollegeClass newCls = new com.college.attendance.model.CollegeClass("B.Tech General", "Computer Science", "A", "2025-2026");
                    return collegeClassRepository.save(newCls);
                });
            }

            className = collegeClass.getClassName();
            if (department == null || department.isBlank()) {
                department = collegeClass.getDepartment();
            }

            Student student = new Student(
                    savedUser,
                    roll,
                    collegeClass,
                    department,
                    request.getSemester() != null ? request.getSemester() : 1,
                    request.getBatch() != null ? request.getBatch() : "2025-2029"
            );
            Student savedStudent = studentRepository.save(student);
            specificId = savedStudent.getId();
            codeOrRoll = savedStudent.getRollNumber();
        } else if (role == Role.FACULTY) {
            String facCode = request.getFacultyCode() != null ? request.getFacultyCode().trim() : ("FAC-" + savedUser.getId());
            if (facultyRepository.findByFacultyCode(facCode).isPresent()) {
                throw new AppException("Faculty code already registered: " + facCode, HttpStatus.CONFLICT);
            }

            if (department == null || department.isBlank()) {
                department = "Computer Science";
            }

            Faculty faculty = new Faculty(
                    savedUser,
                    facCode,
                    department,
                    request.getDesignation() != null ? request.getDesignation() : "Assistant Professor",
                    request.getOfficeRoom() != null ? request.getOfficeRoom() : "Cabin 101"
            );
            Faculty savedFaculty = facultyRepository.save(faculty);
            specificId = savedFaculty.getId();
            codeOrRoll = savedFaculty.getFacultyCode();
        }

        String token = jwtUtil.generateToken(savedUser.getEmail(), savedUser.getRole().name(), savedUser.getId());

        return new AuthResponse(
                token,
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getFullName(),
                savedUser.getRole(),
                specificId,
                codeOrRoll,
                department,
                className
        );
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new AppException("Invalid email or password", HttpStatus.UNAUTHORIZED));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new AppException("Invalid email or password", HttpStatus.UNAUTHORIZED);
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getId());

        Long specificId = null;
        String codeOrRoll = null;
        String department = null;
        String className = null;

        if (user.getRole() == Role.FACULTY) {
            Optional<Faculty> faculty = facultyRepository.findByUserId(user.getId());
            if (faculty.isPresent()) {
                specificId = faculty.get().getId();
                codeOrRoll = faculty.get().getFacultyCode();
                department = faculty.get().getDepartment();
            }
        } else if (user.getRole() == Role.STUDENT) {
            Optional<Student> student = studentRepository.findByUserId(user.getId());
            if (student.isPresent()) {
                specificId = student.get().getId();
                codeOrRoll = student.get().getRollNumber();
                department = student.get().getDepartment();
                if (student.get().getCollegeClass() != null) {
                    className = student.get().getCollegeClass().getClassName();
                }
            }
        }

        return new AuthResponse(
                token,
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                specificId,
                codeOrRoll,
                department,
                className
        );
    }

    public User getCurrentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));
    }

    private static class PasswordResetInfo {
        private final String otp;
        private final java.time.LocalDateTime expiry;

        public PasswordResetInfo(String otp, java.time.LocalDateTime expiry) {
            this.otp = otp;
            this.expiry = expiry;
        }

        public String getOtp() { return otp; }
        public java.time.LocalDateTime getExpiry() { return expiry; }
    }

    private final java.util.Map<String, PasswordResetInfo> resetOtpCache = new java.util.concurrent.ConcurrentHashMap<>();

    public java.util.Map<String, String> generateResetOtp(String email) {
        String cleanEmail = email.trim().toLowerCase();
        User user = userRepository.findByEmail(cleanEmail)
                .orElseThrow(() -> new AppException("No account registered with email: " + email, HttpStatus.NOT_FOUND));

        // Generate a 6-digit OTP
        int randomPin = 100000 + new java.util.Random().nextInt(900000);
        String otp = String.valueOf(randomPin);

        // Valid for 15 minutes
        resetOtpCache.put(cleanEmail, new PasswordResetInfo(otp, java.time.LocalDateTime.now().plusMinutes(15)));

        java.util.Map<String, String> result = new java.util.HashMap<>();
        result.put("email", cleanEmail);
        result.put("otp", otp);
        result.put("message", "A 6-digit verification OTP has been sent. (For instant demo verification, your code is: " + otp + ")");
        return result;
    }

    public void resetPassword(com.college.attendance.dto.ResetPasswordRequest request) {
        String cleanEmail = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(cleanEmail)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        PasswordResetInfo info = resetOtpCache.get(cleanEmail);
        if (info == null) {
            throw new AppException("No reset request found for this email. Please request a new OTP code.", HttpStatus.BAD_REQUEST);
        }

        if (java.time.LocalDateTime.now().isAfter(info.getExpiry())) {
            resetOtpCache.remove(cleanEmail);
            throw new AppException("The OTP code has expired. Please request a new one.", HttpStatus.GONE);
        }

        if (!info.getOtp().equals(request.getOtp().trim())) {
            throw new AppException("Invalid OTP code. Please enter the correct 6-digit code.", HttpStatus.BAD_REQUEST);
        }

        if (request.getNewPassword() == null || request.getNewPassword().length() < 6) {
            throw new AppException("New password must be at least 6 characters long.", HttpStatus.BAD_REQUEST);
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Invalidate OTP after successful reset
        resetOtpCache.remove(cleanEmail);
    }
}
