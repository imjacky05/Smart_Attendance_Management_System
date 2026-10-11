package com.college.attendance.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(
    name = "attendance_records",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"session_id", "student_id"}, name = "uk_session_student")
    }
)
public class AttendanceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "session_id", nullable = false)
    private AttendanceSession attendanceSession;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @Column(nullable = false)
    private LocalDate recordDate;

    @Column(nullable = false)
    private LocalTime recordTime;

    @Column(nullable = false)
    private String status = "PRESENT"; // PRESENT, LATE, ABSENT

    @Column(nullable = false)
    private String method = "QR_SCAN"; // QR_SCAN, FACE_RECOGNITION, MANUAL

    private String verificationDetails; // e.g., "Verified via Camera QR scanner" or "Face confidence: 96.4%"

    private String deviceInfo;

    @Lob
    @Column(columnDefinition = "MEDIUMTEXT")
    private String capturedPhoto; // Base64 snapshot taken during face recognition verification

    public AttendanceRecord() {}

    public AttendanceRecord(AttendanceSession attendanceSession, Student student, Subject subject,
                            LocalDate recordDate, LocalTime recordTime, String status, String method,
                            String verificationDetails, String deviceInfo) {
        this.attendanceSession = attendanceSession;
        this.student = student;
        this.subject = subject;
        this.recordDate = recordDate;
        this.recordTime = recordTime;
        this.status = status;
        this.method = method;
        this.verificationDetails = verificationDetails;
        this.deviceInfo = deviceInfo;
    }

    public AttendanceRecord(AttendanceSession attendanceSession, Student student, Subject subject,
                            LocalDate recordDate, LocalTime recordTime, String status, String method,
                            String verificationDetails, String deviceInfo, String capturedPhoto) {
        this.attendanceSession = attendanceSession;
        this.student = student;
        this.subject = subject;
        this.recordDate = recordDate;
        this.recordTime = recordTime;
        this.status = status;
        this.method = method;
        this.verificationDetails = verificationDetails;
        this.deviceInfo = deviceInfo;
        this.capturedPhoto = capturedPhoto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public AttendanceSession getAttendanceSession() { return attendanceSession; }
    public void setAttendanceSession(AttendanceSession attendanceSession) { this.attendanceSession = attendanceSession; }

    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }

    public Subject getSubject() { return subject; }
    public void setSubject(Subject subject) { this.subject = subject; }

    public LocalDate getRecordDate() { return recordDate; }
    public void setRecordDate(LocalDate recordDate) { this.recordDate = recordDate; }

    public LocalTime getRecordTime() { return recordTime; }
    public void setRecordTime(LocalTime recordTime) { this.recordTime = recordTime; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getMethod() { return method; }
    public void setMethod(String method) { this.method = method; }

    public String getVerificationDetails() { return verificationDetails; }
    public void setVerificationDetails(String verificationDetails) { this.verificationDetails = verificationDetails; }

    public String getDeviceInfo() { return deviceInfo; }
    public void setDeviceInfo(String deviceInfo) { this.deviceInfo = deviceInfo; }

    public String getCapturedPhoto() { return capturedPhoto; }
    public void setCapturedPhoto(String capturedPhoto) { this.capturedPhoto = capturedPhoto; }
}
