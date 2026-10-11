package com.college.attendance.controller;

import com.college.attendance.dto.ApiResponse;
import com.college.attendance.dto.AuthResponse;
import com.college.attendance.dto.LoginRequest;
import com.college.attendance.model.Role;
import com.college.attendance.model.User;
import com.college.attendance.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final com.college.attendance.repository.CollegeClassRepository collegeClassRepository;

    public AuthController(AuthService authService,
                          com.college.attendance.repository.CollegeClassRepository collegeClassRepository) {
        this.authService = authService;
        this.collegeClassRepository = collegeClassRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody com.college.attendance.dto.RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success("Registration successful! Welcome to the portal.", response));
    }

    @GetMapping("/classes")
    public ResponseEntity<ApiResponse<java.util.List<com.college.attendance.model.CollegeClass>>> getRegistrationClasses() {
        return ResponseEntity.ok(ApiResponse.success("Classes list", collegeClassRepository.findAll()));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<java.util.Map<String, String>>> forgotPassword(@Valid @RequestBody com.college.attendance.dto.ForgotPasswordRequest request) {
        java.util.Map<String, String> res = authService.generateResetOtp(request.getEmail());
        return ResponseEntity.ok(ApiResponse.success(res.get("message"), res));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody com.college.attendance.dto.ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Password has been reset successfully! You can now log in.", null));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<User>> getCurrentUser(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }
        User user = authService.getCurrentUser(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Current user profile", user));
    }

    @GetMapping("/demo-accounts")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDemoAccounts() {
        Map<String, Object> demo = new HashMap<>();
        demo.put("faculty", Map.of(
                "email", "faculty@college.edu",
                "password", "faculty123",
                "name", "Dr. Robert Miller",
                "role", "FACULTY",
                "department", "Computer Science"
        ));
        demo.put("student", Map.of(
                "email", "student@college.edu",
                "password", "student123",
                "name", "Alex Johnson",
                "role", "STUDENT",
                "rollNumber", "CS202301"
        ));
        return ResponseEntity.ok(ApiResponse.success("Demo credentials", demo));
    }
}
