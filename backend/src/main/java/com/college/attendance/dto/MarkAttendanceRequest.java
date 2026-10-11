package com.college.attendance.dto;

import jakarta.validation.constraints.NotBlank;

public class MarkAttendanceRequest {

    @NotBlank(message = "QR Token is required")
    private String qrToken;

    private String method = "QR_SCAN"; // QR_SCAN, FACE_RECOGNITION

    private String deviceInfo;

    public MarkAttendanceRequest() {}

    public MarkAttendanceRequest(String qrToken, String method, String deviceInfo) {
        this.qrToken = qrToken;
        this.method = method;
        this.deviceInfo = deviceInfo;
    }

    public String getQrToken() { return qrToken; }
    public void setQrToken(String qrToken) { this.qrToken = qrToken; }

    public String getMethod() { return method; }
    public void setMethod(String method) { this.method = method; }

    public String getDeviceInfo() { return deviceInfo; }
    public void setDeviceInfo(String deviceInfo) { this.deviceInfo = deviceInfo; }
}
