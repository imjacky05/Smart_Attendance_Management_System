package com.college.attendance.model;

import jakarta.persistence.*;

@Entity
@Table(name = "students")
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false, unique = true)
    private String rollNumber; // e.g., "CS202301"

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "class_id", nullable = false)
    private CollegeClass collegeClass;

    private String department;

    private Integer semester;

    private String batch; // e.g., "2023-2027"

    public Student() {}

    public Student(User user, String rollNumber, CollegeClass collegeClass, String department, Integer semester, String batch) {
        this.user = user;
        this.rollNumber = rollNumber;
        this.collegeClass = collegeClass;
        this.department = department;
        this.semester = semester;
        this.batch = batch;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getRollNumber() { return rollNumber; }
    public void setRollNumber(String rollNumber) { this.rollNumber = rollNumber; }

    public CollegeClass getCollegeClass() { return collegeClass; }
    public void setCollegeClass(CollegeClass collegeClass) { this.collegeClass = collegeClass; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }

    public String getBatch() { return batch; }
    public void setBatch(String batch) { this.batch = batch; }
}
