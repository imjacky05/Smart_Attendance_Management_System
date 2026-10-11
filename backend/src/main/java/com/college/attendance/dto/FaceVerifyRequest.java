package com.college.attendance.dto;

import java.util.List;

public class FaceVerifyRequest {

    private Long sessionId;
    private String sessionCode;
    private List<Float> liveDescriptor;
    private String deviceInfo;
    private String capturedPhoto; // Base64 snapshot taken during face verification

    public FaceVerifyRequest() {}

    public Long getSessionId() { return sessionId; }
    public void setSessionId(Long sessionId) { this.sessionId = sessionId; }

    public String getSessionCode() { return sessionCode; }
    public void setSessionCode(String sessionCode) { this.sessionCode = sessionCode; }

    public List<Float> getLiveDescriptor() { return liveDescriptor; }
    public void setLiveDescriptor(List<Float> liveDescriptor) { this.liveDescriptor = liveDescriptor; }

    public String getDeviceInfo() { return deviceInfo; }
    public void setDeviceInfo(String deviceInfo) { this.deviceInfo = deviceInfo; }

    public String getCapturedPhoto() { return capturedPhoto; }
    public void setCapturedPhoto(String capturedPhoto) { this.capturedPhoto = capturedPhoto; }
}
