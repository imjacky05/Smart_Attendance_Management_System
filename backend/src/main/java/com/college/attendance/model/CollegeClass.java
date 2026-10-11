package com.college.attendance.model;

import jakarta.persistence.*;

@Entity
@Table(name = "classes")
public class CollegeClass {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String className; // e.g., "B.Tech CSE - 3rd Year"

    @Column(nullable = false)
    private String department; // e.g., "Computer Science"

    private String section; // e.g., "Section A"

    private String academicYear; // e.g., "2025-2026"

    private Integer totalCapacity = 60;

    public CollegeClass() {}

    public CollegeClass(String className, String department, String section, String academicYear) {
        this.className = className;
        this.department = department;
        this.section = section;
        this.academicYear = academicYear;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }

    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }

    public Integer getTotalCapacity() { return totalCapacity; }
    public void setTotalCapacity(Integer totalCapacity) { this.totalCapacity = totalCapacity; }
}
