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

const WidgetContentBox = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!session?.user) {
      router.push('/');
      return;
    }
    fetchApplications();
  }, [session]);

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/job-applications');
      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }
      const data = await response.json();
      setApplications(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div className="text-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4">Loading applications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-8">
        <p>Error: {error}</p>
        <button 
          onClick={fetchApplications}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  const approvedApplications = applications.filter(app => app.status === 'approved');
  const rejectedApplications = applications.filter(app => app.status === 'rejected');

  return (
    <div className="widget-content">
      <div className="tabs-box">
        <Tabs>
          <div className="aplicants-upper-bar">
            <TabList className="aplicantion-status tab-buttons clearfix">
              <Tab className="tab-btn totals">
                Total(s): {applications.length}
              </Tab>
              <Tab className="tab-btn approved">
                Approved: {approvedApplications.length}
              </Tab>
              <Tab className="tab-btn rejected">
                Rejected: {rejectedApplications.length}
              </Tab>
            </TabList>
          </div>

          <div className="tabs-content">
            <TabPanel>
              <div className="row">
                {applications.map((application) => (
                  <ApplicationCard
                    key={application.id}
                    application={application}
                    onUpdateStatus={updateApplicationStatus}
                    onDelete={deleteApplication}
                  />
                ))}
              </div>
            </TabPanel>

            <TabPanel>
              <div className="row">
                {approvedApplications.map((application) => (
                  <ApplicationCard
                    key={application.id}
                    application={application}
                    onUpdateStatus={updateApplicationStatus}
                    onDelete={deleteApplication}
                  />
                ))}
              </div>
            </TabPanel>

            <TabPanel>
              <div className="row">
                {rejectedApplications.map((application) => (
                  <ApplicationCard
                    key={application.id}
                    application={application}
                    onUpdateStatus={updateApplicationStatus}
                    onDelete={deleteApplication}
                  />
                ))}
              </div>
            </TabPanel>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default WidgetContentBox;