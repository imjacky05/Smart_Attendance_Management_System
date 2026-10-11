package com.college.attendance.controller;

import com.college.attendance.dto.*;
import com.college.attendance.exception.AppException;
import com.college.attendance.model.AttendanceSession;
import com.college.attendance.model.FaceProfile;
import com.college.attendance.model.Student;
import com.college.attendance.model.User;
import com.college.attendance.repository.AttendanceSessionRepository;
import com.college.attendance.repository.StudentRepository;
import com.college.attendance.service.AuthService;
import com.college.attendance.service.FaceRecognitionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/face-recognition")
@PreAuthorize("hasAnyRole('STUDENT', 'FACULTY', 'ADMIN')")
public class FaceRecognitionController {

    private final FaceRecognitionService faceRecognitionService;
    private final AuthService authService;
    private final StudentRepository studentRepository;
    private final AttendanceSessionRepository sessionRepository;

    public FaceRecognitionController(FaceRecognitionService faceRecognitionService,
                                     AuthService authService,
                                     StudentRepository studentRepository,
                                     AttendanceSessionRepository sessionRepository) {
        this.faceRecognitionService = faceRecognitionService;
        this.authService = authService;
        this.studentRepository = studentRepository;
        this.sessionRepository = sessionRepository;
    }

    private Student resolveStudent(Authentication authentication) {
        User user = authService.getCurrentUser(authentication.getName());
        return studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new AppException("Student profile not found. Biometric face module is currently available for students.", HttpStatus.FORBIDDEN));
    }

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<FaceStatusDto>> getStatus(Authentication authentication) {
        Student student = resolveStudent(authentication);
        FaceStatusDto status = faceRecognitionService.getFaceStatus(student.getId());
        return ResponseEntity.ok(ApiResponse.success("Face Recognition module status", status));
    }

    @PostMapping("/consent")
    public ResponseEntity<ApiResponse<FaceProfile>> recordConsent(
            @Valid @RequestBody FaceConsentRequest request,
            Authentication authentication) {
        Student student = resolveStudent(authentication);
        FaceProfile profile = faceRecognitionService.recordConsent(student.getId(), Boolean.TRUE.equals(request.getConsentGiven()));
        String msg = request.getConsentGiven() ? "Informed biometric consent granted successfully." : "Biometric consent revoked.";
        return ResponseEntity.ok(ApiResponse.success(msg, profile));
    }

    @PostMapping("/enroll")
    public ResponseEntity<ApiResponse<FaceProfile>> enrollDescriptor(
            @RequestBody FaceEnrollRequest request,
            Authentication authentication) {
        Student student = resolveStudent(authentication);
        FaceProfile profile = faceRecognitionService.enrollDescriptor(student.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Facial landmark biometric descriptor enrolled successfully. No raw images stored.", profile));
    }

    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<AttendanceRecordDto>> verifyAndMark(
            @RequestBody FaceVerifyRequest request,
            Authentication authentication) {
        Student student = resolveStudent(authentication);
        AttendanceRecordDto record = faceRecognitionService.verifyAndMarkAttendance(student.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Face verified! Attendance recorded successfully.", record));
    }

    @GetMapping("/active-sessions")
    public ResponseEntity<ApiResponse<List<AttendanceSession>>> getActiveSessionsForFaceAttendance() {
        // Return open sessions for students to select during facial verification
        List<AttendanceSession> active = sessionRepository.findAll().stream()
                .filter(s -> "ACTIVE".equalsIgnoreCase(s.getStatus()) && !s.isExpired())
                .toList();
        return ResponseEntity.ok(ApiResponse.success("Available active sessions for face verification", active));
    }
}
