package com.college.attendance.repository;

import com.college.attendance.model.Faculty;
import com.college.attendance.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FacultyRepository extends JpaRepository<Faculty, Long> {
    Optional<Faculty> findByUser(User user);
    Optional<Faculty> findByFacultyCode(String facultyCode);
    Optional<Faculty> findByUserId(Long userId);
}
