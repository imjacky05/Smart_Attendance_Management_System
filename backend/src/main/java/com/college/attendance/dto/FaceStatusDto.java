package com.college.attendance.dto;

import java.time.LocalDateTime;

public class FaceStatusDto {
    private boolean configured;
    private boolean studentConsented;
    private LocalDateTime consentedAt;
    private boolean enrolled;
    private LocalDateTime enrolledAt;
    private String statusMessage;
    private String algorithm;
    private String photoSnapshot;

    public FaceStatusDto() {}

    public FaceStatusDto(boolean configured, boolean studentConsented, LocalDateTime consentedAt,
                         boolean enrolled, LocalDateTime enrolledAt, String statusMessage, String algorithm, String photoSnapshot) {
        this.configured = configured;
        this.studentConsented = studentConsented;
        this.consentedAt = consentedAt;
        this.enrolled = enrolled;
        this.enrolledAt = enrolledAt;
        this.statusMessage = statusMessage;
        this.algorithm = algorithm;
        this.photoSnapshot = photoSnapshot;
    }

    public boolean isConfigured() { return configured; }
    public void setConfigured(boolean configured) { this.configured = configured; }

    public boolean isStudentConsented() { return studentConsented; }
    public void setStudentConsented(boolean studentConsented) { this.studentConsented = studentConsented; }

    public LocalDateTime getConsentedAt() { return consentedAt; }
    public void setConsentedAt(LocalDateTime consentedAt) { this.consentedAt = consentedAt; }

    public boolean isEnrolled() { return enrolled; }
    public void setEnrolled(boolean enrolled) { this.enrolled = enrolled; }

    public LocalDateTime getEnrolledAt() { return enrolledAt; }
    public void setEnrolledAt(LocalDateTime enrolledAt) { this.enrolledAt = enrolledAt; }

    public String getStatusMessage() { return statusMessage; }
    public void setStatusMessage(String statusMessage) { this.statusMessage = statusMessage; }

    public String getAlgorithm() { return algorithm; }
    public void setAlgorithm(String algorithm) { this.algorithm = algorithm; }

    public String getPhotoSnapshot() { return photoSnapshot; }
    public void setPhotoSnapshot(String photoSnapshot) { this.photoSnapshot = photoSnapshot; }
}
