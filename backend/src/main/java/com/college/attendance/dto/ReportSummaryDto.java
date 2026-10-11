package com.college.attendance.dto;

import java.util.List;
import java.util.Map;

public class ReportSummaryDto {
    private long totalRecords;
    private long presentCount;
    private long absentCount;
    private double overallPercentage;
    private Map<String, Long> subjectWiseCount;
    private Map<String, Long> dateWiseCount;
    private List<AttendanceRecordDto> records;

    public ReportSummaryDto() {}

    public long getTotalRecords() { return totalRecords; }
    public void setTotalRecords(long totalRecords) { this.totalRecords = totalRecords; }

    public long getPresentCount() { return presentCount; }
    public void setPresentCount(long presentCount) { this.presentCount = presentCount; }

    public long getAbsentCount() { return absentCount; }
    public void setAbsentCount(long absentCount) { this.absentCount = absentCount; }

    public double getOverallPercentage() { return overallPercentage; }
    public void setOverallPercentage(double overallPercentage) { this.overallPercentage = overallPercentage; }

    public Map<String, Long> getSubjectWiseCount() { return subjectWiseCount; }
    public void setSubjectWiseCount(Map<String, Long> subjectWiseCount) { this.subjectWiseCount = subjectWiseCount; }

    public Map<String, Long> getDateWiseCount() { return dateWiseCount; }
    public void setDateWiseCount(Map<String, Long> dateWiseCount) { this.dateWiseCount = dateWiseCount; }

    public List<AttendanceRecordDto> getRecords() { return records; }
    public void setRecords(List<AttendanceRecordDto> records) { this.records = records; }
}
