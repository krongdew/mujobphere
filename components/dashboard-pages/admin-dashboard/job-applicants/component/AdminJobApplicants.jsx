//components/dashboard-pages/admin-dashboard/job-applicants/component/AdminJobApplicants.jsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const AdminJobApplicants = ({ jobId }) => {
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const fetchJobDetails = async () => {
    try {
      const response = await fetch(`/api/admin/jobs/${jobId}`);
      if (!response.ok) throw new Error('Failed to fetch job details');
      const data = await response.json();
      setJob(data);
    } catch (error) {
      console.error('Error fetching job details:', error);
    }
  };

  const fetchApplicants = async () => {
    try {
      const url = new URL(`/api/admin/jobs/${jobId}/applicants`, window.location.origin);
      url.searchParams.append('page', currentPage);
      url.searchParams.append('limit', itemsPerPage);
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch applicants');
      const data = await response.json();
      
      console.log("Applicants data received:", data);
      
      setApplicants(data.applicants);
      setTotalPages(Math.ceil(data.total / itemsPerPage));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching applicants:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (jobId) {
      fetchJobDetails();
      fetchApplicants();
    }
  }, [jobId, currentPage, itemsPerPage]);

  const updateApplicationStatus = async (applicationId, newStatus) => {
    try {
      const response = await fetch(`/api/admin/applications/${applicationId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update application status');
      
      // Refetch applicants to show updated status
      fetchApplicants();
    } catch (error) {
      console.error('Error updating application status:', error);
      alert('ไม่สามารถอัพเดทสถานะผู้สมัครได้');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const bangkokDate = new Date(
        date.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' })
      );
      return bangkokDate.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <nav className="pagination-wrap">
        <ul className="pagination">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <span className="la la-angle-left"></span>
            </button>
          </li>
          
          {startPage > 1 && (
            <>
              <li className="page-item">
                <button 
                  className="page-link" 
                  onClick={() => handlePageChange(1)}
                >
                  1
                </button>
              </li>
              {startPage > 2 && (
                <li className="page-item disabled">
                  <span className="page-link">...</span>
                </li>
              )}
            </>
          )}
          
          {pageNumbers.map(number => (
            <li key={number} className={`page-item ${number === currentPage ? 'active' : ''}`}>
              <button 
                className="page-link" 
                onClick={() => handlePageChange(number)}
              >
                {number}
              </button>
            </li>
          ))}
          
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && (
                <li className="page-item disabled">
                  <span className="page-link">...</span>
                </li>
              )}
              <li className="page-item">
                <button 
                  className="page-link" 
                  onClick={() => handlePageChange(totalPages)}
                >
                  {totalPages}
                </button>
              </li>
            </>
          )}
          
          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <span className="la la-angle-right"></span>
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  if (loading) {
    return <div>กำลังโหลดข้อมูล...</div>;
  }

  if (!job) {
    return <div>ไม่พบข้อมูลงาน</div>;
  }

  return (
    <div className="tabs-box">
      <div className="widget-title">
        <h4>รายการผู้สมัครงาน: {job.title}</h4>

        <div className="chosen-outer">
          <select 
            className="form-select" 
            style={{ width: '100px', display: 'inline-block' }}
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
          <span className="ml-2" style={{marginLeft: 5}}>รายการต่อหน้า</span>
        </div>
      </div>

      <div className="widget-content">
        <div className="table-outer">
          <table className="default-table manage-job-table">
            <thead>
              <tr>
                <th>ผู้สมัคร</th>
            
                <th>วันที่สมัคร</th>
                <th>สถานะ</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {applicants.map((applicant) => (
                <tr key={applicant.id}>
                  <td>
                    <div className="job-block">
                      <div className="inner-box">
                        <div className="content" style={{paddingLeft: 0}}>
                          <h4>{`${applicant.first_name || ''} ${applicant.last_name || ''}`}</h4>
                          {applicant.faculty && (
                            <div className="mt-1">
                              <strong>คณะ:</strong> {applicant.faculty}
                              {applicant.major && (
                                <>, <strong>สาขา:</strong> {applicant.major}</>
                              )}
                            </div>
                          )}
                          {applicant.gpa && (
                            <div>
                              <strong>GPA:</strong> {applicant.gpa}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td>{formatDate(applicant.applied_at || applicant.created_at)}</td>
                  <td className={`status ${applicant.status}`}>
                    {applicant.status === 'pending' && 'รอพิจารณา'}
                    {applicant.status === 'reviewed' && 'ตรวจสอบแล้ว'}
                    {applicant.status === 'interviewing' && 'นัดสัมภาษณ์'}
                    {applicant.status === 'approved' && 'ตอบรับแล้ว'}
                    {applicant.status === 'rejected' && 'ปฏิเสธแล้ว'}
                  </td>
                  <td>
                    <div className="option-box">
                      <ul className="option-list">
                        {/* <li>
                          <Link 
                            href={`/admin-dashboard/applicant-details/${applicant.id}`} 
                            data-text="ดูรายละเอียด"
                          >
                            <span className="la la-eye"></span>
                          </Link>
                        </li> */}
                        {applicant.status === 'pending' && (
                          <li>
                            <button
                              onClick={() => updateApplicationStatus(applicant.id, 'reviewed')}
                              data-text="ตรวจสอบแล้ว"
                            >
                              <span className="la la-check"></span>
                            </button>
                          </li>
                        )}
                        {(applicant.status === 'pending' || applicant.status === 'reviewed') && (
                          <li>
                            <button
                              onClick={() => updateApplicationStatus(applicant.id, 'interviewing')}
                              data-text="นัดสัมภาษณ์"
                            >
                              <span className="la la-user-tie"></span>
                            </button>
                          </li>
                        )}
                        {(applicant.status === 'pending' || applicant.status === 'reviewed' || applicant.status === 'interviewing') && (
                          <>
                            <li>
                              <button
                                onClick={() => updateApplicationStatus(applicant.id, 'accepted')}
                                data-text="ตอบรับ"
                              >
                                <span className="la la-check-circle"></span>
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() => updateApplicationStatus(applicant.id, 'rejected')}
                                data-text="ปฏิเสธ"
                              >
                                <span className="la la-times-circle"></span>
                              </button>
                            </li>
                          </>
                        )}
                      </ul>
                    </div>
                  </td>
                </tr>
              ))}
              {applicants.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center">ไม่พบข้อมูลผู้สมัครงาน</td>
                </tr>
              )}
            </tbody>
          </table>
          
          {renderPagination()}
        </div>
      </div>
    </div>
  );
};

export default AdminJobApplicants;