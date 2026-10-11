package com.college.attendance.repository;

import com.college.attendance.model.AttendanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {

    boolean existsByAttendanceSessionIdAndStudentId(Long sessionId, Long studentId);

    Optional<AttendanceRecord> findByAttendanceSessionIdAndStudentId(Long sessionId, Long studentId);

    List<AttendanceRecord> findByAttendanceSessionIdOrderByRecordTimeAsc(Long sessionId);

    List<AttendanceRecord> findByStudentIdOrderByRecordDateDescRecordTimeDesc(Long studentId);

    long countByStudentIdAndStatus(Long studentId, String status);

    long countByStudentId(Long studentId);

    @Query("SELECT r FROM AttendanceRecord r WHERE r.attendanceSession.faculty.id = :facultyId ORDER BY r.recordDate DESC, r.recordTime DESC")
    List<AttendanceRecord> findRecentByFacultyId(@Param("facultyId") Long facultyId);

    @Query("SELECT r FROM AttendanceRecord r WHERE " +
           "(:studentId IS NULL OR r.student.id = :studentId) AND " +
           "(:subjectId IS NULL OR r.subject.id = :subjectId) AND " +
           "(:classId IS NULL OR r.student.collegeClass.id = :classId) AND " +
           "(:status IS NULL OR r.status = :status) AND " +
           "(:startDate IS NULL OR r.recordDate >= :startDate) AND " +
           "(:endDate IS NULL OR r.recordDate <= :endDate) " +
           "ORDER BY r.recordDate DESC, r.recordTime DESC")
    List<AttendanceRecord> filterRecords(
            @Param("studentId") Long studentId,
            @Param("subjectId") Long subjectId,
            @Param("classId") Long classId,
            @Param("status") String status,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("SELECT COUNT(r) FROM AttendanceRecord r WHERE r.recordDate = :recordDate AND r.status = 'PRESENT'")
    long countPresentOnDate(@Param("recordDate") LocalDate recordDate);

    @Query("SELECT COUNT(r) FROM AttendanceRecord r WHERE r.attendanceSession.faculty.id = :facultyId AND r.recordDate = :recordDate AND r.status = 'PRESENT'")
    long countPresentByFacultyOnDate(@Param("facultyId") Long facultyId, @Param("recordDate") LocalDate recordDate);
}
