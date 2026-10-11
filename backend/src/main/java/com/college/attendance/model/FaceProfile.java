package com.college.attendance.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "face_profiles")
public class FaceProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false, unique = true)
    private Student student;

    @Column(nullable = false)
    private boolean consentGiven = false;

    private LocalDateTime consentedAt;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String faceDescriptorJson; // 128-dimensional biometric descriptor numbers, NO raw images stored

    @Column(nullable = false)
    private String status = "PENDING"; // PENDING, ACTIVE, REVOKED

    private LocalDateTime enrolledAt;

    private Float confidenceThreshold = 0.65f;

    @Lob
    @Column(columnDefinition = "MEDIUMTEXT")
    private String photoSnapshot; // Enrolled face photo snapshot

    public FaceProfile() {}

    public FaceProfile(Student student, boolean consentGiven, LocalDateTime consentedAt,
                       String faceDescriptorJson, String status, LocalDateTime enrolledAt) {
        this.student = student;
        this.consentGiven = consentGiven;
        this.consentedAt = consentedAt;
        this.faceDescriptorJson = faceDescriptorJson;
        this.status = status;
        this.enrolledAt = enrolledAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }

    public boolean isConsentGiven() { return consentGiven; }
    public void setConsentGiven(boolean consentGiven) { this.consentGiven = consentGiven; }

    public LocalDateTime getConsentedAt() { return consentedAt; }
    public void setConsentedAt(LocalDateTime consentedAt) { this.consentedAt = consentedAt; }

    public String getFaceDescriptorJson() { return faceDescriptorJson; }
    public void setFaceDescriptorJson(String faceDescriptorJson) { this.faceDescriptorJson = faceDescriptorJson; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getEnrolledAt() { return enrolledAt; }
    public void setEnrolledAt(LocalDateTime enrolledAt) { this.enrolledAt = enrolledAt; }

    public Float getConfidenceThreshold() { return confidenceThreshold; }
    public void setConfidenceThreshold(Float confidenceThreshold) { this.confidenceThreshold = confidenceThreshold; }

    public String getPhotoSnapshot() { return photoSnapshot; }
    public void setPhotoSnapshot(String photoSnapshot) { this.photoSnapshot = photoSnapshot; }
}
