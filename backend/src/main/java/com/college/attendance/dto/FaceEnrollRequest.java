package com.college.attendance.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public class FaceEnrollRequest {

    // Numerical biometric descriptor array (e.g. 128 float values)
    private List<Float> descriptor;
    private String photoSnapshot; // Enrolled face photo snapshot for student confirmation

    public FaceEnrollRequest() {}

    public FaceEnrollRequest(List<Float> descriptor) {
        this.descriptor = descriptor;
    }

    public List<Float> getDescriptor() { return descriptor; }
    public void setDescriptor(List<Float> descriptor) { this.descriptor = descriptor; }

    public String getPhotoSnapshot() { return photoSnapshot; }
    public void setPhotoSnapshot(String photoSnapshot) { this.photoSnapshot = photoSnapshot; }
}
