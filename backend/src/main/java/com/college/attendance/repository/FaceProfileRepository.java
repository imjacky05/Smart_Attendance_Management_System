package com.college.attendance.repository;

import com.college.attendance.model.FaceProfile;
import com.college.attendance.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FaceProfileRepository extends JpaRepository<FaceProfile, Long> {
    Optional<FaceProfile> findByStudent(Student student);
    Optional<FaceProfile> findByStudentId(Long studentId);
    boolean existsByStudentId(Long studentId);
}
