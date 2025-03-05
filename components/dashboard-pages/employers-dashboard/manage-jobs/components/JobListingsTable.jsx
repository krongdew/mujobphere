'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { COMPENSATION } from "@/data/unit";

const decodeHtmlEntity = (text) => {
  if (!text) return text;
  return text.replace(/&#x27;/g, "'")
             .replace(/&quot;/g, '"')
             .replace(/&amp;/g, '&')
             .replace(/&lt;/g, '<')
             .replace(/&gt;/g, '>')
             .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec));
};

const JobListingsTable = () => {
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [period, setPeriod] = useState('6');
  const [loading, setLoading] = useState(true);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const handleStatusChange = async (jobId, newStatus) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update status');
      await fetchJobs(); // Refetch the job data after updating the status
    } catch (error) {
      console.error('Error:', error);
      alert('ไม่สามารถอัพเดทสถานะได้');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!confirm('คุณต้องการลบประกาศรับสมัครงานนี้ใช่หรือไม่? การดำเนินการนี้ไม่สามารถเรียกคืนได้')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete job');
      await fetchJobs(); // Refetch the job data after deleting
    } catch (error) {
      console.error('Error:', error);
      alert('ไม่สามารถลบประกาศรับสมัครงานได้');
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await fetch(`/api/jobs/employer?period=${period}&page=${currentPage}&limit=${itemsPerPage}`);
      if (!response.ok) throw new Error('Failed to fetch jobs');
      const data = await response.json();
  
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const localToday = new Date(
        today.getTime() + (today.getTimezoneOffset() * 60 + 7 * 60) * 1000
      );
  
      const updatedJobs = data.jobs.map(job => {
        // Decode HTML entities ในชื่องาน
        const decodedJob = {
          ...job,
          title: decodeHtmlEntity(job.title)
        };
  
        const endDate = new Date(job.application_end_date);
        const localEndDate = new Date(
          endDate.getTime() + (endDate.getTimezoneOffset() * 60 + 7 * 60) * 1000
        );
        localEndDate.setHours(23, 59, 59, 999);
  
        if (job.status === 'published' && localEndDate < localToday) {
          handleStatusChange(job.id, 'closed');
          return { ...decodedJob, status: 'closed' };
        }
        return decodedJob;
      });
  
      setJobs(updatedJobs);
      setTotalPages(Math.ceil(data.total / itemsPerPage));
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [period, currentPage, itemsPerPage]);

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
        day: '2-digit'
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

  return (
    <div className="tabs-box">
      <div className="widget-title">
        <h4>รายการประกาศรับสมัครงาน</h4>

        <div className="chosen-outer">
            <select 
              className="form-select" 
              style={{ width: '100px', display: 'inline-block' }}
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1); // Reset to first page when items per page changes
              }}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
            <span className="ml-2" style={{marginLeft:5}}>รายการต่อหน้า</span>
          </div>
          </div>

      <div className="widget-content">
        <div className="table-outer">
          <h6> เมื่อท่านได้ทำการโพสต์งานแล้ว งานจะอยู่ในสถานะ "แบบร่าง" ซึ่งจะยังไม่ถูกโพสต์บนระบบ กรุณาตรวจสอบรายละเอียดงานอีกครั้งและคลิกที่เครื่องหมายถูก <span className="la la-check"></span> เพื่อเปลี่ยนเป็นสถานะ "เปิดรับสมัคร" </h6>
          <br/>
          
         
          
          <table className="default-table manage-job-table">
            <thead>
              <tr>
                <th>ชื่องาน</th>
                <th>ผู้สมัคร</th>
                <th>วันที่ประกาศ & วันหมดเขต</th>
                <th>สถานะ</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td>
                    <div className="job-block">
                      <div className="inner-box">
                        <div className="content" style={{paddingLeft:0}}>
                          <h4><Link href={`/job-single-v3/${job.id}`}>{job.title}</Link></h4>
                          <ul className="job-info">
                            <li><span className="icon flaticon-briefcase"></span>{job.compensation_amount} บาท/{COMPENSATION[job.compensation_period]}</li>
                            <li><span className="icon flaticon-map-locator"></span>{job.is_online ? 'ออนไลน์' : job.location}</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="applied">
                    <Link href={`/employers-dashboard/all-applicants`}>
                      {job.application_count || 0} คน
                    </Link>
                  </td>
                  <td>{formatDate(job.application_start_date)} <br />{formatDate(job.application_end_date)}</td>
                  <td className={`status ${job.status}`}>
                    {job.status === 'draft' && 'แบบร่าง'}
                    {job.status === 'published' && 'เปิดรับสมัคร'}
                    {job.status === 'closed' && 'ปิดรับสมัคร'}
                  </td>
                  <td>
                    <div className="option-box">
                      <ul className="option-list">
                        <li><Link href={`/job-single-v1/${job.id}`} data-text="ดูรายละเอียดงาน"><span className="la la-eye"></span></Link></li>
                        <li><button onClick={() => router.push(`/employers-dashboard/post-jobs?edit=${job.id}`)} data-text="แก้ไขประกาศ"><span className="la la-pencil"></span></button></li>
                        {job.status === 'draft' && (
                          <li><button onClick={() => handleStatusChange(job.id, 'published')} data-text="เปิดรับสมัคร"><span className="la la-check"></span></button></li>
                        )}
                        {job.status === 'published' && (
                          <li><button onClick={() => handleStatusChange(job.id, 'closed')} data-text="ปิดรับสมัคร"><span className="la la-times-circle"></span></button></li>
                        )}
                        {job.status === 'closed' && (
                          <li><button onClick={() => handleStatusChange(job.id, 'published')} data-text="เปิดรับสมัครอีกครั้ง"><span className="la la-refresh"></span></button></li>
                        )}
                        {job.status === 'closed' && (
                          <li><button onClick={() => handleDeleteJob(job.id)} data-text="ลบประกาศ"><span className="la la-trash"></span></button></li>
                        )}
                      </ul>
                    </div>
                  </td>
                </tr>
              ))}
              {jobs.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center">ไม่พบข้อมูลการประกาศรับสมัครงาน</td>
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

export default JobListingsTable;