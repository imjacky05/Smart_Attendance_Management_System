package com.college.attendance.repository;

import com.college.attendance.model.CollegeClass;
import com.college.attendance.model.Student;
import com.college.attendance.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByUser(User user);
    Optional<Student> findByRollNumber(String rollNumber);
    Optional<Student> findByUserId(Long userId);
    List<Student> findByCollegeClass(CollegeClass collegeClass);
    List<Student> findByCollegeClassId(Long classId);
    long countByCollegeClassId(Long classId);
}
