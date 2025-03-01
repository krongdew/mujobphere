"use client";

import { useState, useEffect } from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const getImageUrl = (path) => {
  if (!path) return "/images/placeholder.jpg";
  let cleanPath = path.replace(/&#x2F;/g, "/");
  const filename = cleanPath.split("/").pop();
  if (!filename) return "/images/placeholder.jpg";
  return `/api/image/${filename}`;
};

const ApplicationCard = ({ application, onUpdateStatus, onDelete }) => {
  return (
    <div className="candidate-block-three col-lg-6 col-md-12 col-sm-12">
      <div className="inner-box">
        <div className="content">
          <figure className="image">
            <Image
              width={90}
              height={90}
              src={getImageUrl(application.img_student)}
              alt={`${application.first_name} ${application.last_name}`}
              unoptimized
            />
          </figure>
          <h4 className="name">
            <Link href={`/candidates-single-v1/${application.student_user_id}?locale=th`}>
              {application.first_name} {application.last_name}
            </Link>
          </h4>

          <ul className="candidate-info">
            <li className="designation">
              {application.job_title}
            </li>
            <li>
              <span className="icon flaticon-briefcase"></span>
              {application.major} - {application.faculty}
            </li>
            <li>
              <span className="icon flaticon-book"></span>
              GPA: {application.gpa}
            </li>
          </ul>

          <div className="post-tags">
            {application.programming_skills?.split(',').map((skill, i) => (
              <span key={i} className="tag">
                {skill.trim()}
              </span>
            ))}
          </div>

          {application.language_skills && (
            <div className="mt-2">
              <small className="text-muted">Languages: {application.language_skills}</small>
            </div>
          )}
        </div>

        <div className="option-box">
        <ul className="option-list">
            <li>
              <Link href={`/candidates-single-v1/${application.student_user_id}?locale=th`}>
                <button data-text="View Application">
                  <span className="la la-eye"></span>
                </button>
              </Link>
            </li>
            <li>
              <button
                data-text="Approve Application"
                onClick={() => onUpdateStatus(application.id, 'approved')}
                disabled={application.status === 'approved'}
                className={application.status === 'approved' ? 'active' : ''}
              >
                <span className="la la-check"></span>
              </button>
            </li>
            <li>
              <button
                data-text="Reject Application"
                onClick={() => onUpdateStatus(application.id, 'rejected')}
                disabled={application.status === 'rejected'}
                className={application.status === 'rejected' ? 'active' : ''}
              >
                <span className="la la-times-circle"></span>
              </button>
            </li>
            <li>
              <button
                data-text="Delete Application"
                onClick={() => onDelete(application.id)}
              >
                <span className="la la-trash"></span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// Pagination component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
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
    <nav className="pagination-wrap mt-4">
      <ul className="pagination">
        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
          <button 
            className="page-link" 
            onClick={() => onPageChange(currentPage - 1)}
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
                onClick={() => onPageChange(1)}
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
              onClick={() => onPageChange(number)}
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
                onClick={() => onPageChange(totalPages)}
              >
                {totalPages}
              </button>
            </li>
          </>
        )}
        
        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
          <button 
            className="page-link" 
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <span className="la la-angle-right"></span>
          </button>
        </li>
      </ul>
    </nav>
  );
};

const WidgetContentBox = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]); // Initialize as empty array
  const [selectedJobId, setSelectedJobId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobsLoading, setJobsLoading] = useState(true);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!session?.user) {
      router.push('/');
      return;
    }
    
    // Fetch jobs for the filter
    fetchJobs();
  }, [session]);

  useEffect(() => {
    if (session?.user) {
      // Fetch applications whenever page, limit, or job filter changes
      fetchApplications();
    }
  }, [currentPage, itemsPerPage, selectedJobId, session]);

  const fetchJobs = async () => {
    try {
      setJobsLoading(true);
      const response = await fetch('/api/jobs/employer?all=true');
      
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }
      
      const data = await response.json();
      
      // Debug what's coming back from the API
      console.log('Jobs API response:', data);
      
      // Ensure we're setting an array
      if (Array.isArray(data)) {
        setJobs(data);
      } else {
        console.error('API did not return an array for jobs:', data);
        setJobs([]);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError(`Error fetching jobs: ${err.message}`);
      setJobs([]);
    } finally {
      setJobsLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      
      // Build the URL with query parameters
      const url = new URL('/api/job-applications', window.location.origin);
      url.searchParams.append('page', currentPage.toString());
      url.searchParams.append('limit', itemsPerPage.toString());
      if (selectedJobId) {
        url.searchParams.append('jobId', selectedJobId);
      }
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }
      
      const data = await response.json();
      console.log('Applications API response:', data);
      
      if (data && Array.isArray(data.applications)) {
        setApplications(data.applications);
        setTotalItems(data.total || 0);
        setTotalPages(data.totalPages || 1);
      } else {
        console.error('Unexpected applications data format:', data);
        setApplications([]);
        setTotalItems(0);
        setTotalPages(1);
      }
      
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError(err.message);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleJobSelect = (jobId) => {
    setSelectedJobId(jobId);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const updateApplicationStatus = async (applicationId, status) => {
    try {
      console.log('Updating status:', { applicationId, status });

      const response = await fetch(`/api/job-applications/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update status');
      }

      alert('Status updated successfully!');
      await fetchApplications();
    } catch (err) {
      console.error('Error updating status:', err);
      setError(err.message);
      // Show error in alert for better visibility
      alert('Error: ' + err.message);
    }
  };

  const deleteApplication = async (applicationId) => {
    if (!window.confirm('Are you sure you want to delete this application?')) {
      return;
    }

    try {
      const response = await fetch(`/api/job-applications/${applicationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete application');
      }

      await fetchApplications();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading && jobsLoading) {
    return (
      <div className="text-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  const approvedApplications = applications.filter(app => app.status === 'approved');
  const rejectedApplications = applications.filter(app => app.status === 'rejected');

  return (
    <div className="widget-content">
      {/* Job Filter */}
      <div className="chosen-outer mb-4">
        <select 
          className="chosen-single form-select" 
          value={selectedJobId || ''}
          onChange={(e) => handleJobSelect(e.target.value)}
          disabled={jobsLoading}
        >
          <option value="">ทั้งหมด (แสดงใบสมัครทุกงาน)</option>
          {Array.isArray(jobs) && jobs.map(job => (
            <option key={job.id} value={job.id}>
              {job.title} ({job.application_count || 0} ใบสมัคร)
            </option>
          ))}
        </select>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>Error: {error}</p>
          <button 
            onClick={() => {
              fetchJobs();
              fetchApplications();
              setError(null);
            }}
            className="mt-2 px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            ลองใหม่
          </button>
        </div>
      )}
      
      <div className="tabs-box">
        <Tabs>
          <div className="aplicants-upper-bar">
            <TabList className="aplicantion-status tab-buttons clearfix">
              <Tab className="tab-btn totals">
                ทั้งหมด: {totalItems}
              </Tab>
              <Tab className="tab-btn approved">
                อนุมัติแล้ว: {approvedApplications.length}
              </Tab>
              <Tab className="tab-btn rejected">
                ปฏิเสธแล้ว: {rejectedApplications.length}
              </Tab>
            </TabList>

            <div className="items-per-page text-right mt-3">
              <select 
                className="form-select" 
                style={{ width: '100px', display: 'inline-block' }}
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1); // Reset to first page when items per page changes
                }}
              >
                <option value="3">3</option>
                <option value="6">6</option>
                <option value="9">9</option>
                <option value="12">12</option>
              </select>
              <span className="ml-2">รายการต่อหน้า</span>
            </div>
          </div>

          <div className="tabs-content">
            <TabPanel>
              <div className="row">
                {applications.length > 0 ? (
                  applications.map((application) => (
                    <ApplicationCard
                      key={application.id}
                      application={application}
                      onUpdateStatus={updateApplicationStatus}
                      onDelete={deleteApplication}
                    />
                  ))
                ) : (
                  <div className="col-12 text-center py-5">
                    <p>ไม่พบข้อมูลใบสมัคร</p>
                  </div>
                )}
              </div>
              {totalPages > 1 && (
                <Pagination 
                  currentPage={currentPage} 
                  totalPages={totalPages} 
                  onPageChange={handlePageChange} 
                />
              )}
            </TabPanel>

            <TabPanel>
              <div className="row">
                {approvedApplications.length > 0 ? (
                  approvedApplications.map((application) => (
                    <ApplicationCard
                      key={application.id}
                      application={application}
                      onUpdateStatus={updateApplicationStatus}
                      onDelete={deleteApplication}
                    />
                  ))
                ) : (
                  <div className="col-12 text-center py-5">
                    <p>ไม่พบข้อมูลใบสมัครที่อนุมัติแล้ว</p>
                  </div>
                )}
              </div>
            </TabPanel>

            <TabPanel>
              <div className="row">
                {rejectedApplications.length > 0 ? (
                  rejectedApplications.map((application) => (
                    <ApplicationCard
                      key={application.id}
                      application={application}
                      onUpdateStatus={updateApplicationStatus}
                      onDelete={deleteApplication}
                    />
                  ))
                ) : (
                  <div className="col-12 text-center py-5">
                    <p>ไม่พบข้อมูลใบสมัครที่ปฏิเสธแล้ว</p>
                  </div>
                )}
              </div>
            </TabPanel>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default WidgetContentBox;