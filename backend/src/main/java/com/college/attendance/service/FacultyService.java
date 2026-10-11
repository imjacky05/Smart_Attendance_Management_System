package com.college.attendance.service;

import com.college.attendance.dto.AttendanceRecordDto;
import com.college.attendance.dto.CreateSessionRequest;
import com.college.attendance.dto.DashboardStatsDto;
import com.college.attendance.exception.AppException;
import com.college.attendance.model.*;
import com.college.attendance.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class FacultyService {

    private final FacultyRepository facultyRepository;
    private final SubjectRepository subjectRepository;
    private final CollegeClassRepository collegeClassRepository;
    private final AttendanceSessionRepository sessionRepository;
    private final AttendanceRecordRepository recordRepository;
    private final StudentRepository studentRepository;

    public FacultyService(FacultyRepository facultyRepository,
                          SubjectRepository subjectRepository,
                          CollegeClassRepository collegeClassRepository,
                          AttendanceSessionRepository sessionRepository,
                          AttendanceRecordRepository recordRepository,
                          StudentRepository studentRepository) {
        this.facultyRepository = facultyRepository;
        this.subjectRepository = subjectRepository;
        this.collegeClassRepository = collegeClassRepository;
        this.sessionRepository = sessionRepository;
        this.recordRepository = recordRepository;
        this.studentRepository = studentRepository;
    }

    public DashboardStatsDto getDashboardStats(Long facultyId) {
        LocalDate today = LocalDate.now();

        // Total enrolled students across classes assigned to this faculty's subjects or all students
        long totalStudents = studentRepository.count();

        // Present students today marked in this faculty's sessions
        long presentToday = recordRepository.countPresentByFacultyOnDate(facultyId, today);

        // Active sessions for this faculty
        List<AttendanceSession> activeSessions = sessionRepository.findActiveSessionsByFaculty(facultyId);

        // Total sessions by this faculty
        List<AttendanceSession> allFacultySessions = sessionRepository.findByFacultyIdOrderByStartTimeDesc(facultyId);
        long totalSessions = allFacultySessions.size();

        // Calculate absent today
        long absentToday = Math.max(0, totalStudents - presentToday);

        // Attendance percentage calculation
        double percentage = totalStudents > 0 ? ((double) presentToday / totalStudents) * 100.0 : 0.0;
        percentage = Math.round(percentage * 10.0) / 10.0;

        // Recent activity records
        List<AttendanceRecord> recentRecords = recordRepository.findRecentByFacultyId(facultyId);
        List<AttendanceRecordDto> recentDtos = recentRecords.stream()
                .limit(10)
                .map(this::mapRecordToDto)
                .collect(Collectors.toList());

        return new DashboardStatsDto(
                totalStudents,
                presentToday,
                absentToday,
                percentage,
                totalSessions,
                activeSessions.size(),
                recentDtos
        );
    }

    public List<Subject> getSubjectsByFaculty(Long facultyId) {
        List<Subject> subjects = subjectRepository.findByFacultyId(facultyId);
        if (subjects.isEmpty()) {
            return subjectRepository.findAll();
        }
        return subjects;
    }

    public List<CollegeClass> getAllClasses() {
        return collegeClassRepository.findAll();
    }

    @Transactional
    public AttendanceSession createSession(Long facultyId, CreateSessionRequest request) {
        Faculty faculty = facultyRepository.findById(facultyId)
                .orElseThrow(() -> new AppException("Faculty profile not found", HttpStatus.NOT_FOUND));

        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new AppException("Subject not found", HttpStatus.NOT_FOUND));

        CollegeClass collegeClass = collegeClassRepository.findById(request.getClassId())
                .orElseThrow(() -> new AppException("Class not found", HttpStatus.NOT_FOUND));

        LocalDate sessionDate = request.getSessionDate() != null ? request.getSessionDate() : LocalDate.now();
        LocalDateTime startTime = LocalDateTime.now();
        int duration = request.getDurationMinutes() != null && request.getDurationMinutes() > 0 ? request.getDurationMinutes() : 15;
        LocalDateTime expiryTime = startTime.plusMinutes(duration);

        // Format session code: SES-YYYYMMDD-SUBJ-UUID4
        String dateStr = sessionDate.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String shortId = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        String sessionCode = "SES-" + dateStr + "-" + subject.getSubjectCode() + "-" + shortId;

        // Generate encrypted/secure unique QR token containing session identifier
        String qrToken = "ATT-" + UUID.randomUUID().toString();

        AttendanceSession session = new AttendanceSession(
                sessionCode,
                qrToken,
                faculty,
                collegeClass,
                subject,
                sessionDate,
                startTime,
                expiryTime,
                duration,
                "ACTIVE",
                request.getRoomNumber()
        );

        return sessionRepository.save(session);
    }

    public List<AttendanceSession> getActiveSessions(Long facultyId) {
        List<AttendanceSession> sessions = sessionRepository.findActiveSessionsByFaculty(facultyId);
        // Automatically check expiry
        LocalDateTime now = LocalDateTime.now();
        for (AttendanceSession s : sessions) {
            if (s.getExpiryTime() != null && now.isAfter(s.getExpiryTime()) && "ACTIVE".equals(s.getStatus())) {
                s.setStatus("EXPIRED");
                sessionRepository.save(s);
            }
        }
        return sessionRepository.findActiveSessionsByFaculty(facultyId);
    }

    @Transactional
    public AttendanceSession closeSession(Long facultyId, Long sessionId) {
        AttendanceSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new AppException("Session not found", HttpStatus.NOT_FOUND));

        if (!session.getFaculty().getId().equals(facultyId)) {
            throw new AppException("Unauthorized to modify this session", HttpStatus.FORBIDDEN);
        }

        session.setStatus("CLOSED");
        return sessionRepository.save(session);
    }

    public List<AttendanceRecordDto> getSessionScannedStudents(Long sessionId) {
        List<AttendanceRecord> records = recordRepository.findByAttendanceSessionIdOrderByRecordTimeAsc(sessionId);
        return records.stream().map(this::mapRecordToDto).collect(Collectors.toList());
    }

    public AttendanceRecordDto mapRecordToDto(AttendanceRecord record) {
        AttendanceRecordDto dto = new AttendanceRecordDto();
        dto.setId(record.getId());
        if (record.getAttendanceSession() != null) {
            dto.setSessionId(record.getAttendanceSession().getId());
            dto.setSessionCode(record.getAttendanceSession().getSessionCode());
            if (record.getAttendanceSession().getFaculty() != null &&
                record.getAttendanceSession().getFaculty().getUser() != null) {
                dto.setFacultyName(record.getAttendanceSession().getFaculty().getUser().getFullName());
            }
        }
        if (record.getStudent() != null) {
            dto.setStudentId(record.getStudent().getId());
            dto.setRollNumber(record.getStudent().getRollNumber());
            if (record.getStudent().getUser() != null) {
                dto.setStudentName(record.getStudent().getUser().getFullName());
            }
            if (record.getStudent().getCollegeClass() != null) {
                dto.setClassName(record.getStudent().getCollegeClass().getClassName());
            }
        }
        if (record.getSubject() != null) {
            dto.setSubjectId(record.getSubject().getId());
            dto.setSubjectCode(record.getSubject().getSubjectCode());
            dto.setSubjectName(record.getSubject().getSubjectName());
        }
        dto.setRecordDate(record.getRecordDate());
        dto.setRecordTime(record.getRecordTime());
        dto.setStatus(record.getStatus());
        dto.setMethod(record.getMethod());
        dto.setVerificationDetails(record.getVerificationDetails());
        dto.setCapturedPhoto(record.getCapturedPhoto());
        return dto;
    }
}
