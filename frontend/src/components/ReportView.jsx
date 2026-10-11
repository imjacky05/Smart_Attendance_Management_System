import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  Filter,
  RotateCcw,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  PieChart,
  BarChart3,
  Calendar,
  Camera,
  X,
} from 'lucide-react';
import { reportApi } from '../api/reportApi';

export default function ReportView() {
  const [filterOptions, setFilterOptions] = useState({ students: [], subjects: [], classes: [] });
  const [loadingOptions, setLoadingOptions] = useState(true);

  // Filters state
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Report results
  const [reportData, setReportData] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // Load filter dropdown options
  useEffect(() => {
    async function fetchOptions() {
      try {
        setLoadingOptions(true);
        const res = await reportApi.getFilterOptions();
        if (res.success && res.data) {
          setFilterOptions(res.data);
        }
      } catch (err) {
        console.error('Error loading filter options', err);
      } finally {
        setLoadingOptions(false);
      }
    }
    fetchOptions();
  }, []);

  // Fetch report data
  const handleApplyFilters = async () => {
    setLoadingReport(true);
    try {
      const payload = {
        studentId: selectedStudentId ? Number(selectedStudentId) : null,
        subjectId: selectedSubjectId ? Number(selectedSubjectId) : null,
        classId: selectedClassId ? Number(selectedClassId) : null,
        status: selectedStatus || null,
        startDate: startDate || null,
        endDate: endDate || null,
      };

      const res = await reportApi.filterReports(payload);
      if (res.success && res.data) {
        setReportData(res.data);
      }
    } catch (err) {
      console.error('Error fetching reports', err);
    } finally {
      setLoadingReport(false);
    }
  };

  useEffect(() => {
    handleApplyFilters();
  }, []);

  const handleResetFilters = () => {
    setSelectedStudentId('');
    setSelectedSubjectId('');
    setSelectedClassId('');
    setSelectedStatus('');
    setStartDate('');
    setEndDate('');
    setSearchTerm('');
    setTimeout(handleApplyFilters, 0);
  };

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const payload = {
        studentId: selectedStudentId ? Number(selectedStudentId) : null,
        subjectId: selectedSubjectId ? Number(selectedSubjectId) : null,
        classId: selectedClassId ? Number(selectedClassId) : null,
        status: selectedStatus || null,
        startDate: startDate || null,
        endDate: endDate || null,
      };

      const filename = `attendance_report_${new Date().toISOString().split('T')[0]}.csv`;
      await reportApi.exportCsv(payload, filename);
    } catch (err) {
      alert('Failed to export CSV report: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  // Filter records by local search query
  const records = reportData?.records || [];
  const filteredRecords = records.filter((r) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (r.studentName && r.studentName.toLowerCase().includes(term)) ||
      (r.rollNumber && r.rollNumber.toLowerCase().includes(term)) ||
      (r.subjectName && r.subjectName.toLowerCase().includes(term)) ||
      (r.subjectCode && r.subjectCode.toLowerCase().includes(term)) ||
      (r.className && r.className.toLowerCase().includes(term))
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Filter Control Bar */}
      <div className="card-panel">
        <div className="card-header">
          <div className="card-title">
            <Filter size={18} color="#2563eb" />
            <span>Attendance Filter Criteria</span>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleExportCsv}
            disabled={exporting || records.length === 0}
          >
            <Download size={16} />
            <span>{exporting ? 'Generating CSV...' : 'Export CSV Report'}</span>
          </button>
        </div>

        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {/* Student Filter */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Student</label>
              <select
                className="form-select"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
              >
                <option value="">All Students</option>
                {filterOptions.students?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.rollNumber})
                  </option>
                ))}
              </select>
            </div>

            {/* Subject Filter */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Subject</label>
              <select
                className="form-select"
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
              >
                <option value="">All Subjects</option>
                {filterOptions.subjects?.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.code}: {sub.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Class Filter */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Class</label>
              <select
                className="form-select"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
              >
                <option value="">All Classes</option>
                {filterOptions.classes?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="PRESENT">Present</option>
                <option value="ABSENT">Absent</option>
                <option value="LATE">Late</option>
              </select>
            </div>

            {/* Start Date */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">From Date</label>
              <input
                type="date"
                className="form-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            {/* End Date */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">To Date</label>
              <input
                type="date"
                className="form-input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={handleResetFilters}>
              <RotateCcw size={15} />
              <span>Reset Filters</span>
            </button>
            <button className="btn btn-primary" onClick={handleApplyFilters} disabled={loadingReport}>
              <Filter size={15} />
              <span>{loadingReport ? 'Filtering...' : 'Apply Filters'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      {reportData && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div className="stat-card">
            <div className="stat-info">
              <span className="stat-label">Total Records</span>
              <span className="stat-value">{reportData.totalRecords}</span>
            </div>
            <div className="stat-icon-wrapper icon-blue">
              <FileSpreadsheet size={24} />
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-info">
              <span className="stat-label">Present Count</span>
              <span className="stat-value" style={{ color: '#059669' }}>{reportData.presentCount}</span>
            </div>
            <div className="stat-icon-wrapper icon-green">
              <CheckCircle2 size={24} />
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-info">
              <span className="stat-label">Absent Count</span>
              <span className="stat-value" style={{ color: '#dc2626' }}>{reportData.absentCount}</span>
            </div>
            <div className="stat-icon-wrapper icon-red">
              <XCircle size={24} />
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-info">
              <span className="stat-label">Attendance Rate</span>
              <span className="stat-value" style={{ color: '#2563eb' }}>{reportData.overallPercentage}%</span>
            </div>
            <div className="stat-icon-wrapper icon-purple">
              <PieChart size={24} />
            </div>
          </div>
        </div>
      )}

      {/* Subject Distribution Bar Visualizer */}
      {reportData && reportData.subjectWiseCount && Object.keys(reportData.subjectWiseCount).length > 0 && (
        <div className="card-panel">
          <div className="card-header">
            <div className="card-title">
              <BarChart3 size={18} color="#2563eb" />
              <span>Subject-Wise Attendance Distribution</span>
            </div>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {Object.entries(reportData.subjectWiseCount).map(([subjectName, count]) => {
                const max = reportData.totalRecords || 1;
                const pct = Math.min(100, Math.round((count / max) * 100));
                return (
                  <div key={subjectName}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                      <strong style={{ color: '#1e293b' }}>{subjectName}</strong>
                      <span style={{ color: '#64748b' }}>{count} sessions attended ({pct}%)</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)', borderRadius: '4px' }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Records Table */}
      <div className="card-panel">
        <div className="card-header">
          <div className="card-title">
            <span>Filtered Attendance Records ({filteredRecords.length})</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '260px' }}>
            <Search size={16} color="#64748b" />
            <input
              type="text"
              placeholder="Search table rows..."
              className="form-input"
              style={{ padding: '6px 12px', fontSize: '0.82rem' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          {filteredRecords.length === 0 ? (
            <div className="empty-state">
              <p>No attendance records match the selected filters.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Photo</th>
                    <th>Student Name</th>
                    <th>Roll Number</th>
                    <th>Class</th>
                    <th>Subject</th>
                    <th>Faculty</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Method</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((r) => (
                    <tr key={r.id}>
                      <td>
                        {r.capturedPhoto ? (
                          <img
                            src={r.capturedPhoto}
                            alt={r.studentName}
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '8px',
                              objectFit: 'cover',
                              border: '2px solid #2563eb',
                              cursor: 'pointer',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}
                            onClick={() => setSelectedPhoto(r)}
                            title="Click to view student face snapshot"
                          />
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>-</span>
                        )}
                      </td>
                      <td><strong>{r.studentName}</strong></td>
                      <td>{r.rollNumber}</td>
                      <td>{r.className}</td>
                      <td>
                        <span style={{ fontWeight: 600, color: '#1e40af' }}>{r.subjectCode}</span> - {r.subjectName}
                      </td>
                      <td>{r.facultyName}</td>
                      <td>{r.recordDate?.toString()}</td>
                      <td>{r.recordTime ? r.recordTime.toString().substring(0, 5) : '-'}</td>
                      <td>
                        <span className={`badge ${r.status === 'PRESENT' ? 'badge-present' : 'badge-absent'}`}>
                          {r.status === 'PRESENT' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                          {r.status}
                        </span>
                      </td>
                      <td>
                        <span className="badge-method">{r.method}</span>
                      </td>
                      <td style={{ fontSize: '0.78rem', color: '#64748b' }}>{r.verificationDetails}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Report Student Photo Modal */}
      {selectedPhoto && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '400px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
              position: 'relative',
              textAlign: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              style={{
                position: 'absolute',
                top: '14px',
                right: '14px',
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#475569',
              }}
            >
              <X size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#1e3a8a', marginBottom: '14px' }}>
              <Camera size={20} color="#2563eb" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Student Attendance Face Photo</h3>
            </div>

            <img
              src={selectedPhoto.capturedPhoto}
              alt="Student Face Snapshot"
              style={{
                width: '260px',
                height: '260px',
                objectFit: 'cover',
                borderRadius: '12px',
                border: '3px solid #2563eb',
                margin: '0 auto',
                display: 'block',
                boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.2)',
              }}
            />

            <div style={{ marginTop: '16px', padding: '12px', background: '#eff6ff', borderRadius: '10px' }}>
              <p style={{ fontSize: '0.92rem', color: '#1e40af', fontWeight: 700 }}>
                {selectedPhoto.studentName} ({selectedPhoto.rollNumber})
              </p>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                Class: {selectedPhoto.className} • Method: <strong style={{ color: '#2563eb' }}>{selectedPhoto.method}</strong>
              </p>
              <p style={{ fontSize: '0.78rem', color: '#059669', marginTop: '2px', fontWeight: 600 }}>
                {selectedPhoto.verificationDetails}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
