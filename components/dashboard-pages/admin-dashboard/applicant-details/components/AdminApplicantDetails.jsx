'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const AdminApplicantDetails = ({ applicationId }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const fetchApplicationDetails = async () => {
    try {
      const response = await fetch(`/api/admin/applicants/${applicationId}`);
      console.log(applicationId)
      if (!response.ok) throw new Error('Failed to fetch application details');
      const data = await response.json();
      setApplication(data);
      setLoading(false);
    } catch (error) {
        console.log(applicationId)
      console.error('Error fetching application details:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicationDetails();
  }, [applicationId]);

  const updateApplicationStatus = async (newStatus) => {
    try {
      const response = await fetch(`/api/admin/applications/${applicationId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update application status');
      
      // Refetch application to show updated status
      fetchApplicationDetails();
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

  if (loading) {
    return <div>กำลังโหลดข้อมูล...</div>;
  }

  if (!application) {
    return <div>ไม่พบข้อมูลผู้สมัคร</div>;
  }

  const {
    job_title,
    job_id,
    applicant_name,
    applicant_email,
    applicant_phone,
    applicant_line_id,
    education,
    university,
    faculty,
    major,
    education_year,
    bio,
    skills,
    experience,
    status,
    cover_letter,
    created_at,
    updated_at,
    employer
  } = application;

  return (
    <div className="tabs-box">
      <div className="widget-title">
        <h4>รายละเอียดผู้สมัคร</h4>
        
        <div className="chosen-outer">
          <button 
            className="btn btn-secondary mr-2" 
            style={{ marginRight: '10px' }}
            onClick={() => router.back()}
          >
            <span className="la la-arrow-left"></span> ย้อนกลับ
          </button>
          <Link 
            href={`/admin-dashboard/job-applicants/${job_id}`}
            className="btn btn-info"
          >
            ดูผู้สมัครอื่นๆ
          </Link>
        </div>
      </div>

      <div className="widget-content">
        <div className="default-form">
          <div className="row">
            {/* Job Information Section */}
            <div className="col-lg-12">
              <div className="card mb-4">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">ข้อมูลงาน</h5>
                  <Link 
                    href={`/job-single-v1/${job_id}`}
                    className="btn btn-outline-info btn-sm"
                  >
                    ดูประกาศเต็ม
                  </Link>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <h6>ชื่องาน:</h6>
                      <p className="text-dark">{job_title}</p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <h6>ผู้ประกาศ:</h6>
                      <p className="text-dark">{employer?.employer_name || 'ไม่ระบุ'}</p>
                      {employer?.employer_email && <p>{employer.employer_email}</p>}
                      {employer?.employer_phone && <p>{employer.employer_phone}</p>}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Applicant Information Section */}
            <div className="col-lg-12">
              <div className="card mb-4">
                <div className="card-header">
                  <h5 className="mb-0">ข้อมูลผู้สมัคร</h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <h6>ชื่อผู้สมัคร:</h6>
                      <p className="text-dark">{applicant_name || 'ไม่ระบุ'}</p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <h6>สถานะใบสมัคร:</h6>
                      <span className={`badge badge-${
                        status === 'pending' ? 'warning' :
                        status === 'reviewed' ? 'info' :
                        status === 'interviewing' ? 'primary' :
                        status === 'accepted' ? 'success' :
                        status === 'rejected' ? 'danger' : 'secondary'
                      } px-3 py-2`}>
                        {status === 'pending' && 'รอพิจารณา'}
                        {status === 'reviewed' && 'ตรวจสอบแล้ว'}
                        {status === 'interviewing' && 'นัดสัมภาษณ์'}
                        {status === 'accepted' && 'ตอบรับแล้ว'}
                        {status === 'rejected' && 'ปฏิเสธแล้ว'}
                      </span>
                    </div>
                    <div className="col-md-6 mb-3">
                      <h6>อีเมล:</h6>
                      <p className="text-dark">{applicant_email || 'ไม่ระบุ'}</p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <h6>เบอร์โทรศัพท์:</h6>
                      <p className="text-dark">{applicant_phone || 'ไม่ระบุ'}</p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <h6>Line ID:</h6>
                      <p className="text-dark">{applicant_line_id || 'ไม่ระบุ'}</p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <h6>วันที่สมัคร:</h6>
                      <p className="text-dark">{formatDate(created_at)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Education & Skills Section */}
            <div className="col-lg-12">
              <div className="card mb-4">
                <div className="card-header">
                  <h5 className="mb-0">การศึกษาและทักษะ</h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <h6>ระดับการศึกษา:</h6>
                      <p className="text-dark">{education || 'ไม่ระบุ'}</p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <h6>สถาบันการศึกษา:</h6>
                      <p className="text-dark">{university || 'ไม่ระบุ'}</p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <h6>คณะ:</h6>
                      <p className="text-dark">{faculty || 'ไม่ระบุ'}</p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <h6>สาขา:</h6>
                      <p className="text-dark">{major || 'ไม่ระบุ'}</p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <h6>ชั้นปี:</h6>
                      <p className="text-dark">{education_year || 'ไม่ระบุ'}</p>
                    </div>
                  </div>

                  {skills && (
                    <div className="row mt-3">
                      <div className="col-md-12">
                        <h6>ทักษะ:</h6>
                        <p className="text-dark">{skills}</p>
                      </div>
                    </div>
                  )}

                  {experience && (
                    <div className="row mt-3">
                      <div className="col-md-12">
                        <h6>ประสบการณ์:</h6>
                        <p className="text-dark">{experience}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Cover Letter Section */}
            {cover_letter && (
              <div className="col-lg-12">
                <div className="card mb-4">
                  <div className="card-header">
                    <h5 className="mb-0">จดหมายสมัครงาน</h5>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-12">
                        <div className="p-3 bg-light rounded">
                          {cover_letter.split('\n').map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* About Me Section */}
            {bio && (
              <div className="col-lg-12">
                <div className="card mb-4">
                  <div className="card-header">
                    <h5 className="mb-0">เกี่ยวกับฉัน</h5>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-12">
                        <div className="p-3 bg-light rounded">
                          {bio.split('\n').map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions Section */}
            <div className="col-lg-12">
              <div className="card mb-4">
                <div className="card-header">
                  <h5 className="mb-0">ดำเนินการ</h5>
                </div>
                <div className="card-body">
                  <div className="btn-group w-100">
                    {status === 'pending' && (
                      <button 
                        className="btn btn-info mr-2" 
                        style={{marginRight: '10px'}}
                        onClick={() => updateApplicationStatus('reviewed')}
                      >
                        <span className="la la-check"></span> ตรวจสอบแล้ว
                      </button>
                    )}
                    
                    {(status === 'pending' || status === 'reviewed') && (
                      <button 
                        className="btn btn-primary mr-2" 
                        style={{marginRight: '10px'}}
                        onClick={() => updateApplicationStatus('interviewing')}
                      >
                        <span className="la la-user-tie"></span> นัดสัมภาษณ์
                      </button>
                    )}
                    
                    {(status === 'pending' || status === 'reviewed' || status === 'interviewing') && (
                      <>
                        <button 
                          className="btn btn-success mr-2" 
                          style={{marginRight: '10px'}}
                          onClick={() => updateApplicationStatus('accepted')}
                        >
                          <span className="la la-check-circle"></span> ตอบรับ
                        </button>
                        
                        <button 
                          className="btn btn-danger" 
                          onClick={() => updateApplicationStatus('rejected')}
                        >
                          <span className="la la-times-circle"></span> ปฏิเสธ
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminApplicantDetails;