package com.college.attendance.dto;

import com.college.attendance.model.Role;

public class AuthResponse {
    private String token;
    private Long userId;
    private String email;
    private String fullName;
    private Role role;
    private Long specificId; // facultyId or studentId
    private String codeOrRoll; // facultyCode or rollNumber
    private String department;
    private String className;

    public AuthResponse() {}

    public AuthResponse(String token, Long userId, String email, String fullName, Role role,
                        Long specificId, String codeOrRoll, String department, String className) {
        this.token = token;
        this.userId = userId;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
        this.specificId = specificId;
        this.codeOrRoll = codeOrRoll;
        this.department = department;
        this.className = className;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public Long getSpecificId() { return specificId; }
    public void setSpecificId(Long specificId) { this.specificId = specificId; }

    public String getCodeOrRoll() { return codeOrRoll; }
    public void setCodeOrRoll(String codeOrRoll) { this.codeOrRoll = codeOrRoll; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }
}
