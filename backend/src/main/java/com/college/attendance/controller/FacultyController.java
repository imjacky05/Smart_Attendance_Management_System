package com.college.attendance.controller;

import com.college.attendance.dto.ApiResponse;
import com.college.attendance.dto.AttendanceRecordDto;
import com.college.attendance.dto.CreateSessionRequest;
import com.college.attendance.dto.DashboardStatsDto;
import com.college.attendance.exception.AppException;
import com.college.attendance.model.AttendanceSession;
import com.college.attendance.model.CollegeClass;
import com.college.attendance.model.Faculty;
import com.college.attendance.model.Subject;
import com.college.attendance.model.User;
import com.college.attendance.repository.FacultyRepository;
import com.college.attendance.service.AuthService;
import com.college.attendance.service.FacultyService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/faculty")
@PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
public class FacultyController {

    private final FacultyService facultyService;
    private final AuthService authService;
    private final FacultyRepository facultyRepository;

    public FacultyController(FacultyService facultyService,
                             AuthService authService,
                             FacultyRepository facultyRepository) {
        this.facultyService = facultyService;
        this.authService = authService;
        this.facultyRepository = facultyRepository;
    }

    private Faculty resolveFaculty(Authentication authentication) {
        User user = authService.getCurrentUser(authentication.getName());
        return facultyRepository.findByUserId(user.getId())
                .orElseThrow(() -> new AppException("Faculty profile not found for user", HttpStatus.NOT_FOUND));
    }

    @GetMapping("/dashboard-stats")
    public ResponseEntity<ApiResponse<DashboardStatsDto>> getDashboardStats(Authentication authentication) {
        Faculty faculty = resolveFaculty(authentication);
        DashboardStatsDto stats = facultyService.getDashboardStats(faculty.getId());
        return ResponseEntity.ok(ApiResponse.success("Dashboard metrics loaded", stats));
    }

    @GetMapping("/subjects")
    public ResponseEntity<ApiResponse<List<Subject>>> getSubjects(Authentication authentication) {
        Faculty faculty = resolveFaculty(authentication);
        List<Subject> subjects = facultyService.getSubjectsByFaculty(faculty.getId());
        return ResponseEntity.ok(ApiResponse.success("Subjects loaded", subjects));
    }

    @GetMapping("/classes")
    public ResponseEntity<ApiResponse<List<CollegeClass>>> getClasses() {
        List<CollegeClass> classes = facultyService.getAllClasses();
        return ResponseEntity.ok(ApiResponse.success("Classes loaded", classes));
    }

    @PostMapping("/sessions")
    public ResponseEntity<ApiResponse<AttendanceSession>> createSession(
            @Valid @RequestBody CreateSessionRequest request,
            Authentication authentication) {
        Faculty faculty = resolveFaculty(authentication);
        AttendanceSession session = facultyService.createSession(faculty.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Attendance QR session generated successfully", session));
    }

    @GetMapping("/sessions/active")
    public ResponseEntity<ApiResponse<List<AttendanceSession>>> getActiveSessions(Authentication authentication) {
        Faculty faculty = resolveFaculty(authentication);
        List<AttendanceSession> sessions = facultyService.getActiveSessions(faculty.getId());
        return ResponseEntity.ok(ApiResponse.success("Active sessions loaded", sessions));
    }

    @PostMapping("/sessions/{sessionId}/close")
    public ResponseEntity<ApiResponse<AttendanceSession>> closeSession(
            @PathVariable Long sessionId,
            Authentication authentication) {
        Faculty faculty = resolveFaculty(authentication);
        AttendanceSession session = facultyService.closeSession(faculty.getId(), sessionId);
        return ResponseEntity.ok(ApiResponse.success("Session closed successfully", session));
    }

    @GetMapping("/sessions/{sessionId}/scanned-students")
    public ResponseEntity<ApiResponse<List<AttendanceRecordDto>>> getScannedStudents(@PathVariable Long sessionId) {
        List<AttendanceRecordDto> scanned = facultyService.getSessionScannedStudents(sessionId);
        return ResponseEntity.ok(ApiResponse.success("Scanned students list", scanned));
    }
}
