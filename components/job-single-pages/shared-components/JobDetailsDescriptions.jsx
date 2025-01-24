import React from 'react';
import { format } from 'date-fns';

const JobDetailsDescriptions = ({ jobPost }) => {
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMMM dd, yyyy');
  };

  return (
    <div className="job-detail">
      <h4>Job Description</h4>
      <p>{jobPost.job_description}</p>

      {jobPost.project_description && (
        <>
          <h4>Project Description</h4>
          <p>{jobPost.project_description}</p>
        </>
      )}

      <h4>Job Details</h4>
      <ul className="list-style-three">
        <li>
          <strong>Hire Type:</strong> {jobPost.hire_type}
        </li>
        <li>
          <strong>Location:</strong> {jobPost.location}
        </li>
        <li>
          <strong>Compensation:</strong> {jobPost.compensation_amount} {jobPost.compensation_period}
        </li>
        <li>
          <strong>Work Period:</strong> 
          {formatDate(jobPost.work_start_date)} 
          {jobPost.work_end_indefinite 
            ? ' - Ongoing' 
            : jobPost.work_end_date 
              ? ` - ${formatDate(jobPost.work_end_date)}` 
              : ''}
        </li>
        <li>
          <strong>Application Period:</strong> 
          {` ${formatDate(jobPost.application_start_date)} - ${formatDate(jobPost.application_end_date)}`}
        </li>
      </ul>

      {jobPost.education_level && (
        <>
          <h4>Education Level</h4>
          <p>{jobPost.education_level}</p>
        </>
      )}

      {jobPost.additional_requirements && (
        <>
          <h4>Additional Requirements</h4>
          <p>{jobPost.additional_requirements}</p>
        </>
      )}
    </div>
  );
};

export default JobDetailsDescriptions;