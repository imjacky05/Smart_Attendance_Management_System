package com.college.attendance.service;

import com.college.attendance.dto.AttendanceRecordDto;
import com.college.attendance.dto.ReportFilterRequest;
import com.college.attendance.dto.ReportSummaryDto;
import com.college.attendance.model.AttendanceRecord;
import com.college.attendance.repository.AttendanceRecordRepository;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final AttendanceRecordRepository recordRepository;
    private final FacultyService facultyService;

    public ReportService(AttendanceRecordRepository recordRepository, FacultyService facultyService) {
        this.recordRepository = recordRepository;
        this.facultyService = facultyService;
    }

    public ReportSummaryDto generateReport(ReportFilterRequest filter) {
        List<AttendanceRecord> rawRecords = recordRepository.filterRecords(
                filter.getStudentId(),
                filter.getSubjectId(),
                filter.getClassId(),
                filter.getStatus(),
                filter.getStartDate(),
                filter.getEndDate()
        );

        List<AttendanceRecordDto> dtos = rawRecords.stream()
                .map(facultyService::mapRecordToDto)
                .collect(Collectors.toList());

        long total = dtos.size();
        long present = dtos.stream().filter(r -> "PRESENT".equalsIgnoreCase(r.getStatus())).count();
        long absent = total - present;

        double percentage = total > 0 ? ((double) present / total) * 100.0 : 0.0;
        percentage = Math.round(percentage * 10.0) / 10.0;

        // Subject-wise distribution
        Map<String, Long> subjectWise = new LinkedHashMap<>();
        for (AttendanceRecordDto r : dtos) {
            String subName = r.getSubjectName() != null ? r.getSubjectName() : "Unknown";
            subjectWise.put(subName, subjectWise.getOrDefault(subName, 0L) + 1);
        }

        // Date-wise distribution
        Map<String, Long> dateWise = new LinkedHashMap<>();
        for (AttendanceRecordDto r : dtos) {
            String d = r.getRecordDate() != null ? r.getRecordDate().toString() : "Unknown";
            dateWise.put(d, dateWise.getOrDefault(d, 0L) + 1);
        }

        ReportSummaryDto summary = new ReportSummaryDto();
        summary.setTotalRecords(total);
        summary.setPresentCount(present);
        summary.setAbsentCount(absent);
        summary.setOverallPercentage(percentage);
        summary.setSubjectWiseCount(subjectWise);
        summary.setDateWiseCount(dateWise);
        summary.setRecords(dtos);

        return summary;
    }

    public byte[] generateCsvReport(ReportFilterRequest filter) {
        ReportSummaryDto report = generateReport(filter);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (PrintWriter writer = new PrintWriter(baos, true, StandardCharsets.UTF_8)) {
            // Write CSV Header
            writer.println("Record ID,Student Name,Roll Number,Class,Subject Code,Subject Name,Faculty,Date,Time,Status,Verification Method,Details");

            for (AttendanceRecordDto r : report.getRecords()) {
                StringBuilder line = new StringBuilder();
                line.append(r.getId() != null ? r.getId() : "").append(",");
                line.append(escapeCsv(r.getStudentName())).append(",");
                line.append(escapeCsv(r.getRollNumber())).append(",");
                line.append(escapeCsv(r.getClassName())).append(",");
                line.append(escapeCsv(r.getSubjectCode())).append(",");
                line.append(escapeCsv(r.getSubjectName())).append(",");
                line.append(escapeCsv(r.getFacultyName())).append(",");
                line.append(r.getRecordDate() != null ? r.getRecordDate().toString() : "").append(",");
                line.append(r.getRecordTime() != null ? r.getRecordTime().toString() : "").append(",");
                line.append(escapeCsv(r.getStatus())).append(",");
                line.append(escapeCsv(r.getMethod())).append(",");
                line.append(escapeCsv(r.getVerificationDetails()));
                writer.println(line.toString());
            }

            // Write Summary Trailer
            writer.println();
            writer.println("--- SUMMARY METRICS ---");
            writer.println("Total Records," + report.getTotalRecords());
            writer.println("Total Present," + report.getPresentCount());
            writer.println("Total Absent," + report.getAbsentCount());
            writer.println("Attendance Percentage," + report.getOverallPercentage() + "%");
        }

        return baos.toByteArray();
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
