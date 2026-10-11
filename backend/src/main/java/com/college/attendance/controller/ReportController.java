package com.college.attendance.controller;

import com.college.attendance.dto.ApiResponse;
import com.college.attendance.dto.ReportFilterRequest;
import com.college.attendance.dto.ReportSummaryDto;
import com.college.attendance.model.CollegeClass;
import com.college.attendance.model.Student;
import com.college.attendance.model.Subject;
import com.college.attendance.repository.CollegeClassRepository;
import com.college.attendance.repository.StudentRepository;
import com.college.attendance.repository.SubjectRepository;
import com.college.attendance.service.ReportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@PreAuthorize("hasAnyRole('FACULTY', 'STUDENT', 'ADMIN')")
public class ReportController {

    private final ReportService reportService;
    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;
    private final CollegeClassRepository collegeClassRepository;

    public ReportController(ReportService reportService,
                            StudentRepository studentRepository,
                            SubjectRepository subjectRepository,
                            CollegeClassRepository collegeClassRepository) {
        this.reportService = reportService;
        this.studentRepository = studentRepository;
        this.subjectRepository = subjectRepository;
        this.collegeClassRepository = collegeClassRepository;
    }

    @PostMapping("/filter")
    public ResponseEntity<ApiResponse<ReportSummaryDto>> filterReports(@RequestBody ReportFilterRequest filter) {
        ReportSummaryDto summary = reportService.generateReport(filter);
        return ResponseEntity.ok(ApiResponse.success("Report generated", summary));
    }

    @PostMapping("/export-csv")
    public ResponseEntity<byte[]> exportCsv(@RequestBody ReportFilterRequest filter) {
        byte[] csvBytes = reportService.generateCsvReport(filter);

        String filename = "attendance_report_" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) + ".csv";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(csvBytes);
    }

    @GetMapping("/filter-options")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getFilterOptions() {
        Map<String, Object> options = new HashMap<>();

        List<Student> students = studentRepository.findAll();
        List<Subject> subjects = subjectRepository.findAll();
        List<CollegeClass> classes = collegeClassRepository.findAll();

        options.put("students", students.stream().map(s -> Map.of(
                "id", s.getId(),
                "name", s.getUser() != null ? s.getUser().getFullName() : "Student",
                "rollNumber", s.getRollNumber()
        )).toList());

        options.put("subjects", subjects.stream().map(sub -> Map.of(
                "id", sub.getId(),
                "name", sub.getSubjectName(),
                "code", sub.getSubjectCode()
        )).toList());

        options.put("classes", classes.stream().map(c -> Map.of(
                "id", c.getId(),
                "name", c.getClassName()
        )).toList());

        return ResponseEntity.ok(ApiResponse.success("Filter dropdown options loaded", options));
    }
}
