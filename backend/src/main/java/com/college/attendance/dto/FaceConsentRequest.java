package com.college.attendance.dto;

import jakarta.validation.constraints.NotNull;

public class FaceConsentRequest {
    @NotNull(message = "Consent status is required")
    private Boolean consentGiven;

    public FaceConsentRequest() {}

    public FaceConsentRequest(Boolean consentGiven) {
        this.consentGiven = consentGiven;
    }

    public Boolean getConsentGiven() { return consentGiven; }
    public void setConsentGiven(Boolean consentGiven) { this.consentGiven = consentGiven; }
}
