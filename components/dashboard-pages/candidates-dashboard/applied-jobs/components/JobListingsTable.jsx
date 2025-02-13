"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";

const getImageUrl = (path) => {
  if (!path) return "/images/default-company-logo.png";
  let cleanPath = path.replace(/&#x2F;/g, "/");
  const filename = cleanPath.split("/").pop();
  if (!filename) return "/images/default-company-logo.png";
  return `/api/image/${filename}`;
};

const JobListingsTable = () => {
  const { data: session } = useSession();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterMonths, setFilterMonths] = useState(6);

  useEffect(() => {
    if (!session?.user) return;
    fetchApplications();
  }, [session, filterMonths]);

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/student/applications');
      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }
      const data = await response.json();
      setApplications(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleDelete = async (applicationId) => {
    if (!window.confirm('Are you sure you want to delete this application?')) {
      return;
    }

    try {
      console.log('Deleting application:', applicationId);
      
      const response = await fetch(`/api/student/applications/${applicationId}`, {
        method: 'DELETE',
      });

      console.log('Delete response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete application');
      }

      // Refresh the applications list
      fetchApplications();
      alert('Application deleted successfully');
    } catch (err) {
      console.error('Error deleting application:', err);
      alert(err.message || 'Failed to delete application');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!session) {
    return <div className="text-center py-5">Please login to view your applications</div>;
  }

  if (loading) {
    return <div className="text-center py-5">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-5">Error: {error}</div>;
  }

  return (
    <div className="tabs-box">
      <div className="widget-title">
        <h4>My Applied Jobs</h4>

        <div className="chosen-outer">
          <select
            className="chosen-single form-select"
            value={filterMonths}
            onChange={(e) => setFilterMonths(Number(e.target.value))}
          >
            <option value={6}>Last 6 Months</option>
            <option value={12}>Last 12 Months</option>
            <option value={16}>Last 16 Months</option>
            <option value={24}>Last 24 Months</option>
            <option value={60}>Last 5 year</option>
          </select>
        </div>
      </div>

      <div className="widget-content">
        <div className="table-outer">
          <table className="default-table manage-job-table">
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Date Applied</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {applications.map((application) => (
                <tr key={application.id}>
                  <td>
                    <div className="job-block">
                      <div className="inner-box">
                        <div className="content">
                          <span className="company-logo">
                            <Image
                              width={50}
                              height={49}
                              src={getImageUrl(application.company_logo)}
                              alt="company logo"
                              unoptimized
                            />
                          </span>
                          <h4>
                            <Link href={`/job-single-v1/${application.job_post_id}`}>
                              {application.job_title}
                            </Link>
                          </h4>
                          <ul className="job-info">
                            <li>
                              <span className="icon flaticon-briefcase"></span>
                              {application.company_name || application.department}
                            </li>
                            {application.location && (
                              <li>
                                <span className="icon flaticon-map-locator"></span>
                                {application.location}
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{formatDate(application.applied_at)}</td>
                  <td className={`status ${application.status}`}>
                    {application.status}
                  </td>
                  <td>
                    <div className="option-box">
                      <ul className="option-list">
                        <li>
                          <Link href={`/job-single-v1/${application.job_post_id}?locale=th`}>
                            <button data-text="View Application">
                              <span className="la la-eye"></span>
                            </button>
                          </Link>
                        </li>
                        <li>
                          <button
                            data-text="Delete Application"
                            onClick={() => handleDelete(application.id)}
                          >
                            <span className="la la-trash"></span>
                          </button>
                        </li>
                      </ul>
                    </div>
                  </td>
                </tr>
              ))}

              {applications.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-5">
                    No applications found
                  </td>
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