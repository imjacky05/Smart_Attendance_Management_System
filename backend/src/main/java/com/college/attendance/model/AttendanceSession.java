package com.college.attendance.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "attendance_sessions")
public class AttendanceSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String sessionCode; // e.g., "SES-20261011-CS501-A1"

    @Column(nullable = false, unique = true, length = 500)
    private String qrToken; // unique encrypted token embedded in QR code

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "faculty_id", nullable = false)
    private Faculty faculty;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "class_id", nullable = false)
    private CollegeClass collegeClass;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @Column(nullable = false)
    private LocalDate sessionDate;

    @Column(nullable = false)
    private LocalDateTime startTime;

    private LocalDateTime expiryTime;

    private Integer durationMinutes = 15;

    @Column(nullable = false)
    private String status = "ACTIVE"; // ACTIVE, CLOSED, EXPIRED

    private String roomNumber = "LH-301";

    public AttendanceSession() {}

    public AttendanceSession(String sessionCode, String qrToken, Faculty faculty, CollegeClass collegeClass,
                             Subject subject, LocalDate sessionDate, LocalDateTime startTime,
                             LocalDateTime expiryTime, Integer durationMinutes, String status, String roomNumber) {
        this.sessionCode = sessionCode;
        this.qrToken = qrToken;
        this.faculty = faculty;
        this.collegeClass = collegeClass;
        this.subject = subject;
        this.sessionDate = sessionDate;
        this.startTime = startTime;
        this.expiryTime = expiryTime;
        this.durationMinutes = durationMinutes;
        this.status = status;
        this.roomNumber = roomNumber;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSessionCode() { return sessionCode; }
    public void setSessionCode(String sessionCode) { this.sessionCode = sessionCode; }

    public String getQrToken() { return qrToken; }
    public void setQrToken(String qrToken) { this.qrToken = qrToken; }

    public Faculty getFaculty() { return faculty; }
    public void setFaculty(Faculty faculty) { this.faculty = faculty; }

    public CollegeClass getCollegeClass() { return collegeClass; }
    public void setCollegeClass(CollegeClass collegeClass) { this.collegeClass = collegeClass; }

    public Subject getSubject() { return subject; }
    public void setSubject(Subject subject) { this.subject = subject; }

    public LocalDate getSessionDate() { return sessionDate; }
    public void setSessionDate(LocalDate sessionDate) { this.sessionDate = sessionDate; }

    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

    public LocalDateTime getExpiryTime() { return expiryTime; }
    public void setExpiryTime(LocalDateTime expiryTime) { this.expiryTime = expiryTime; }

    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }

    public boolean isExpired() {
        if ("CLOSED".equalsIgnoreCase(status)) return true;
        if (expiryTime != null && LocalDateTime.now().isAfter(expiryTime)) {
            return true;
        }
        return false;
    }
}
