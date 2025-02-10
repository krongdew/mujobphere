import React from 'react';
import { format } from 'date-fns';

const JobOverView = ({ jobPost }) => {
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMMM dd, yyyy');
  };

  return (
    <div className="widget-content">
      <ul className="job-overview">
        <li>
          <i className="icon icon-calendar"></i>
          <h5>Date Posted:</h5>
          <span>{formatDate(jobPost.created_at || jobPost.application_start_date)}</span>
        </li>
        <li>
          <i className="icon icon-clock"></i>
          <h5>Job Type:</h5>
          <span>{jobPost.hire_type}</span>
        </li>
        <li>
          <i className="icon icon-map-marker"></i>
          <h5>Location:</h5>
          <span>{jobPost.is_online ? 'ออนไลน์' : jobPost.location}</span>
        </li>
        <li>
          <i className="icon icon-money"></i>
          <h5>Salary:</h5>
          <span>
            {jobPost.compensation_amount} {jobPost.compensation_period}
            {jobPost.payment_type === 'installment' ? ' (Installment)' : ''}
          </span>
        </li>
        <li>
          <i className="icon icon-calendar"></i>
          <h5>Application Deadline:</h5>
          <span>{formatDate(jobPost.application_end_date)}</span>
        </li>
      </ul>
    </div>
  );
};

export default JobOverView;