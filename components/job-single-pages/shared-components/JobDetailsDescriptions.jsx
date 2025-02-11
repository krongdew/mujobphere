import React from 'react';
import { format } from 'date-fns';

const JobDetailsDescriptions = ({ jobPost }) => {
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMMM dd, yyyy');
  };
  
  const AMOUNT_TYPE_MAP = {
    percentage: 'เปอร์เซ็นต์ (%)',
    fixed: 'บาท'
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
          <strong>Hire Type:</strong> {HIRETYPE[jobPost.hire_type]}
        </li>
        <li>
          <strong>Location:</strong> {jobPost.is_online ? 'ออนไลน์' : jobPost.location}
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

      {jobPost.has_interview && (
        <>
          <h4>มีการสัมภาษณ์งาน</h4>
          <p>{jobPost.has_interview === true ? 'มี' : 'ไม่มี'}</p>
          <h4>รายละเอียดการสัมภาษณ์</h4>
          <p>{jobPost.interview_details}</p>
        </>
      )}

      {jobPost.work_start_date && (
        <>
          <h4>วันที่เริ่มปฏิบัติงาน</h4>
          <p>{formatDate(jobPost.work_start_date)}</p>
          <h4>วันที่สิ้นสุดการปฏิบัติงาน</h4>
          <p>  {jobPost.work_end_indefinite ? 'ไม่มีกำหนด' : formatDate(jobPost.work_end_date)}</p>
        </>
      )}

      {jobPost.compensation_amount && (
        <>
          <h4>Salary</h4>
          <p> {jobPost.compensation_amount} {COMPENSATION[jobPost.compensation_period]}</p>
        </>
      )}
      
      {jobPost.payment_type && (
        <>
          <h4>รูปแบบการจ่ายเงิน</h4>
          <p>{PAYMENT_TYPE_MAP[jobPost.payment_type] || ''}</p>
        </>
      )}
      
      {jobPost.payment_type === 'installment' && (
          <>
            <div className="form-group col-lg-12 col-md-12">
              <label>จำนวนงวด *</label>
              <p>{jobPost.installment_count}</p>
              
            </div>

            {Array.from({ length: jobPost.installment_count }, (_, index) => (
              <div key={index} className="row mx-0 bg-light p-3 mb-3">
                <div className="col-12">
                  <h4>งวดที่ {index + 1}</h4>
                </div>
                <div className="form-group col-lg-6 col-md-12">
                  <label>จำนวน *</label>
                  <p>{jobPost.payment_installments[index]?.amount || ''}</p>
                  
                </div>
                <div className="form-group col-lg-6 col-md-12">
                  <label>หน่วย *</label>
                  <p>{AMOUNT_TYPE_MAP[jobPost.payment_installments[index]?.amount_type] || ''}</p>
                 
                </div>
              </div>
            ))}
          </>
        )}
    </div>
  );
};

export default JobDetailsDescriptions;