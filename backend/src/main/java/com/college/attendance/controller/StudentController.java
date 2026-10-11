package com.college.attendance.controller;

import com.college.attendance.dto.ApiResponse;
import com.college.attendance.dto.AttendanceRecordDto;
import com.college.attendance.dto.MarkAttendanceRequest;
import com.college.attendance.exception.AppException;
import com.college.attendance.model.Student;
import com.college.attendance.model.User;
import com.college.attendance.repository.StudentRepository;
import com.college.attendance.service.AuthService;
import com.college.attendance.service.StudentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/student")
@PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
public class StudentController {

    private final StudentService studentService;
    private final AuthService authService;
    private final StudentRepository studentRepository;

    public StudentController(StudentService studentService,
                             AuthService authService,
                             StudentRepository studentRepository) {
        this.studentService = studentService;
        this.authService = authService;
        this.studentRepository = studentRepository;
    }

    private Student resolveStudent(Authentication authentication) {
        User user = authService.getCurrentUser(authentication.getName());
        return studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new AppException("Student profile not found", HttpStatus.NOT_FOUND));
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<Student>> getProfile(Authentication authentication) {
        Student student = resolveStudent(authentication);
        return ResponseEntity.ok(ApiResponse.success("Student profile loaded", student));
    }

    @PostMapping("/mark-attendance")
    public ResponseEntity<ApiResponse<AttendanceRecordDto>> markAttendance(
            @Valid @RequestBody MarkAttendanceRequest request,
            Authentication authentication) {
        Student student = resolveStudent(authentication);
        AttendanceRecordDto record = studentService.markAttendanceByQr(student.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Attendance successfully marked for " + record.getSubjectName() + "!", record));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<AttendanceRecordDto>>> getAttendanceHistory(Authentication authentication) {
        Student student = resolveStudent(authentication);
        List<AttendanceRecordDto> history = studentService.getAttendanceHistory(student.getId());
        return ResponseEntity.ok(ApiResponse.success("Attendance history loaded", history));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStudentStats(Authentication authentication) {
        Student student = resolveStudent(authentication);
        Map<String, Object> stats = studentService.getStudentStats(student.getId());
        return ResponseEntity.ok(ApiResponse.success("Student attendance statistics", stats));
    }
}
