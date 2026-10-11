package com.college.attendance.service;

import com.college.attendance.dto.AttendanceRecordDto;
import com.college.attendance.dto.MarkAttendanceRequest;
import com.college.attendance.exception.AppException;
import com.college.attendance.model.AttendanceRecord;
import com.college.attendance.model.AttendanceSession;
import com.college.attendance.model.Student;
import com.college.attendance.repository.AttendanceRecordRepository;
import com.college.attendance.repository.AttendanceSessionRepository;
import com.college.attendance.repository.StudentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class StudentService {

    private final StudentRepository studentRepository;
    private final AttendanceSessionRepository sessionRepository;
    private final AttendanceRecordRepository recordRepository;
    private final FacultyService facultyService;

    public StudentService(StudentRepository studentRepository,
                          AttendanceSessionRepository sessionRepository,
                          AttendanceRecordRepository recordRepository,
                          FacultyService facultyService) {
        this.studentRepository = studentRepository;
        this.sessionRepository = sessionRepository;
        this.recordRepository = recordRepository;
        this.facultyService = facultyService;
    }

    public Student getStudentProfile(Long studentId) {
        return studentRepository.findById(studentId)
                .orElseThrow(() -> new AppException("Student profile not found", HttpStatus.NOT_FOUND));
    }

    public Student getStudentByUserId(Long userId) {
        return studentRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException("Student profile not found for user", HttpStatus.NOT_FOUND));
    }

    @Transactional
    public AttendanceRecordDto markAttendanceByQr(Long studentId, MarkAttendanceRequest request) {
        Student student = getStudentProfile(studentId);

        String qrToken = request.getQrToken() != null ? request.getQrToken().trim() : "";
        if (qrToken.isEmpty()) {
            throw new AppException("Invalid QR code scanned. Token is empty.", HttpStatus.BAD_REQUEST);
        }

        AttendanceSession session = sessionRepository.findByQrToken(qrToken)
                .orElseThrow(() -> new AppException("Invalid QR Code: Session not found or inactive.", HttpStatus.NOT_FOUND));

        // Validate session status
        if ("CLOSED".equalsIgnoreCase(session.getStatus())) {
            throw new AppException("This attendance session has already been closed by faculty.", HttpStatus.BAD_REQUEST);
        }

        // Validate session expiry
        if (session.getExpiryTime() != null && LocalDateTime.now().isAfter(session.getExpiryTime())) {
            session.setStatus("EXPIRED");
            sessionRepository.save(session);
            throw new AppException("QR Code has expired! Please ask faculty to generate or renew the session.", HttpStatus.GONE);
        }

        // Enforce duplicate attendance prevention
        boolean alreadyMarked = recordRepository.existsByAttendanceSessionIdAndStudentId(session.getId(), student.getId());
        if (alreadyMarked) {
            throw new AppException("Duplicate Attendance Warning: You have already marked attendance for this session (" + session.getSessionCode() + ")!", HttpStatus.CONFLICT);
        }

        // Optional class verification
        if (student.getCollegeClass() != null && session.getCollegeClass() != null) {
            if (!student.getCollegeClass().getId().equals(session.getCollegeClass().getId())) {
                // Log warning or soft verify
            }
        }

        String method = (request.getMethod() != null && !request.getMethod().isBlank()) ? request.getMethod() : "QR_SCAN";
        String verificationDetails = "Camera QR Verification Successful (Session: " + session.getSessionCode() + ")";

        AttendanceRecord record = new AttendanceRecord(
                session,
                student,
                session.getSubject(),
                LocalDate.now(),
                LocalTime.now(),
                "PRESENT",
                method,
                verificationDetails,
                request.getDeviceInfo() != null ? request.getDeviceInfo() : "Web Camera Scanner"
        );

        AttendanceRecord savedRecord = recordRepository.save(record);
        return facultyService.mapRecordToDto(savedRecord);
    }

    public List<AttendanceRecordDto> getAttendanceHistory(Long studentId) {
        List<AttendanceRecord> records = recordRepository.findByStudentIdOrderByRecordDateDescRecordTimeDesc(studentId);
        return records.stream().map(facultyService::mapRecordToDto).collect(Collectors.toList());
    }

    public Map<String, Object> getStudentStats(Long studentId) {
        long totalPresent = recordRepository.countByStudentIdAndStatus(studentId, "PRESENT");
        long totalRecords = recordRepository.countByStudentId(studentId);
        long absent = totalRecords - totalPresent;

        double percentage = totalRecords > 0 ? ((double) totalPresent / totalRecords) * 100.0 : 0.0;
        percentage = Math.round(percentage * 10.0) / 10.0;

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalLectures", totalRecords);
        stats.put("attendedLectures", totalPresent);
        stats.put("absentLectures", absent);
        stats.put("attendancePercentage", percentage);

        return stats;
    }
}
