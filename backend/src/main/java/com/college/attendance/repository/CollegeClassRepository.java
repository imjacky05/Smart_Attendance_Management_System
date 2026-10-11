package com.college.attendance.repository;

import com.college.attendance.model.CollegeClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CollegeClassRepository extends JpaRepository<CollegeClass, Long> {
    Optional<CollegeClass> findByClassName(String className);
}
