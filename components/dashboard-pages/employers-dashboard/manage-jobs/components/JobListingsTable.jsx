'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';

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

const JobListingsTable = () => {
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [period, setPeriod] = useState('6');
  const [loading, setLoading] = useState(true);

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

  const fetchJobs = async () => {
    try {
      const response = await fetch(`/api/jobs/employer?period=${period}`);
      if (!response.ok) throw new Error('Failed to fetch jobs');
      const data = await response.json();

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const localToday = new Date(
        today.getTime() + (today.getTimezoneOffset() * 60 + 7 * 60) * 1000
      );

      const updatedJobs = data.map(job => {
        const endDate = new Date(job.application_end_date);
        const localEndDate = new Date(
          endDate.getTime() + (endDate.getTimezoneOffset() * 60 + 7 * 60) * 1000
        );
        localEndDate.setHours(23, 59, 59, 999);

        if (job.status === 'published' && localEndDate < localToday) {
          handleStatusChange(job.id, 'closed');
          return { ...job, status: 'closed' };
        }
        return job;
      });

      setJobs(updatedJobs);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [period]);
  // const formatDate = (dateString) => {
  //   if (!dateString) return '';
  //   try {
  //     const date = new Date(dateString);
  //     const bangkokDate = new Date(
  //       date.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' })
  //     );
  //     return bangkokDate.toLocaleDateString('th-TH', {
  //       year: 'numeric',
  //       month: 'long',
  //       day: 'numeric'
  //     });
  //   } catch (error) {
  //     console.error('Error formatting date:', error);
  //     return '';
  //   }
  // };

  if (loading) {
    return <div>กำลังโหลดข้อมูล...</div>;
  }

  return (
    <div className="tabs-box">
      <div className="widget-title">
        <h4>รายการประกาศรับสมัครงาน</h4>

        <div className="chosen-outer">
          <select 
            className="chosen-single form-select"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="6">6 เดือนล่าสุด</option>
            <option value="12">12 เดือนล่าสุด</option>
            <option value="24">24 เดือนล่าสุด</option>
          </select>
        </div>
      </div>

      <div className="widget-content">
        <div className="table-outer">
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
                            <li><span className="icon flaticon-briefcase"></span>{job.compensation_amount} บาท/{job.compensation_period}</li>
                            <li><span className="icon flaticon-map-locator"></span>{job.is_online ? 'ออนไลน์' : job.location}</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="applied">
                    <Link href={`/employers-dashboard/applicants/${job.id}`}>
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
        </div>
      </div>
    </div>
  );
};

export default JobListingsTable;