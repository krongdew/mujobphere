import React from 'react';
import { format } from 'date-fns';

const JobOverView = ({ jobPost }) => {
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMMM dd, yyyy');
  };
  
  const PAYMENT_TYPE_MAP = {
    single: 'จ่ายครั้งเดียว',
    before_start: 'ก่อนเริ่มงาน',
    after_complete: 'เมื่อจบงาน',
    installment: 'จ่ายเป็นงวด'
  };
  
  const COMPENSATION = {
    per_time: 'ต่อครั้ง',
    per_hour: 'ต่อชั่วโมง',
    per_day: 'ต่อวัน',
    per_project: 'ต่อโครงการ',
    other: 'อื่น ๆ',
  }
  
  const HIRETYPE = {
    faculty: 'จ้างในนามคณะ/ส่วนงาน',
    personal: '>จ้างส่วนบุคคล (จ้างส่วนตัว)'
  }

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
          <span>{HIRETYPE[jobPost.hire_type]}</span>
        </li>
        <li>
          <i className="icon flaticon-map-locator" style={{color:'#578FCA',fontSize: "23px"}}></i>
          <h5>Location:</h5>
          <span>{jobPost.is_online ? 'ออนไลน์' : jobPost.location}</span>
        </li>
        <li>
          <i className="icon flaticon-money" style={{color:'#578FCA',fontSize: "23px"}}></i>
          <h5>Salary:</h5>
          <span>
            {jobPost.compensation_amount} {COMPENSATION[jobPost.compensation_period]} 
             / {PAYMENT_TYPE_MAP[jobPost.payment_type] || ''}
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