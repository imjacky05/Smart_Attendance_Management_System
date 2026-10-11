package com.college.attendance.repository;

import com.college.attendance.model.AttendanceSession;
import com.college.attendance.model.Faculty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceSessionRepository extends JpaRepository<AttendanceSession, Long> {
    Optional<AttendanceSession> findByQrToken(String qrToken);
    Optional<AttendanceSession> findBySessionCode(String sessionCode);
    List<AttendanceSession> findByFacultyOrderByStartTimeDesc(Faculty faculty);
    List<AttendanceSession> findByFacultyIdOrderByStartTimeDesc(Long facultyId);
    List<AttendanceSession> findByCollegeClassId(Long classId);
    List<AttendanceSession> findBySubjectId(Long subjectId);
    List<AttendanceSession> findBySessionDate(LocalDate sessionDate);

    @Query("SELECT s FROM AttendanceSession s WHERE s.faculty.id = :facultyId AND s.status = 'ACTIVE' ORDER BY s.startTime DESC")
    List<AttendanceSession> findActiveSessionsByFaculty(@Param("facultyId") Long facultyId);
}
