package com.college.attendance.dto;

import java.util.List;

public class DashboardStatsDto {
    private long totalStudents;
    private long presentToday;
    private long absentToday;
    private double attendancePercentage;
    private long totalSessions;
    private long activeSessions;
    private List<AttendanceRecordDto> recentActivity;

    public DashboardStatsDto() {}

    public DashboardStatsDto(long totalStudents, long presentToday, long absentToday,
                             double attendancePercentage, long totalSessions,
                             long activeSessions, List<AttendanceRecordDto> recentActivity) {
        this.totalStudents = totalStudents;
        this.presentToday = presentToday;
        this.absentToday = absentToday;
        this.attendancePercentage = attendancePercentage;
        this.totalSessions = totalSessions;
        this.activeSessions = activeSessions;
        this.recentActivity = recentActivity;
    }

    public long getTotalStudents() { return totalStudents; }
    public void setTotalStudents(long totalStudents) { this.totalStudents = totalStudents; }

    public long getPresentToday() { return presentToday; }
    public void setPresentToday(long presentToday) { this.presentToday = presentToday; }

    public long getAbsentToday() { return absentToday; }
    public void setAbsentToday(long absentToday) { this.absentToday = absentToday; }

    public double getAttendancePercentage() { return attendancePercentage; }
    public void setAttendancePercentage(double attendancePercentage) { this.attendancePercentage = attendancePercentage; }

    public long getTotalSessions() { return totalSessions; }
    public void setTotalSessions(long totalSessions) { this.totalSessions = totalSessions; }

    public long getActiveSessions() { return activeSessions; }
    public void setActiveSessions(long activeSessions) { this.activeSessions = activeSessions; }

    public List<AttendanceRecordDto> getRecentActivity() { return recentActivity; }
    public void setRecentActivity(List<AttendanceRecordDto> recentActivity) { this.recentActivity = recentActivity; }
}
