'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const defaultFormState = {
  hire_type: '',
  job_type_id: '',
  other_job_type: '',
  title: '',
  application_start_date: null,
  application_end_date: null,
  has_interview: false,
  interview_details: '',
  work_start_date: null,
  work_end_date: null,
  work_end_indefinite: false,
  work_time_start: '',
  work_time_end: '',
  is_online: false,
  location: '',
  compensation_amount: '',
  compensation_period: '',
  compensation_other: '',
  project_description: '',
  job_description: '',
  education_level: '',
  additional_requirements: '',
  preferred_faculty_id: null,
  payment_type: 'single',
  payment_installments: [],
  installment_count: 2
};

const PostBoxForm = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditMode = !!editId;

  const [loading, setLoading] = useState(isEditMode);
  const [jobTypes, setJobTypes] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [formData, setFormData] = useState({
    ...defaultFormState,
    hire_type: session?.user?.role === 'employeroutside' ? 'personal' : defaultFormState.hire_type
  });


  // Fetch job types and faculties
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (formData.hire_type) {
          const response = await fetch(`/api/job-types?hire_type=${formData.hire_type}`);
          if (!response.ok) throw new Error('Failed to fetch job types');
          const data = await response.json();
          setJobTypes(data);
        }

        const facultiesResponse = await fetch('/api/faculties');
        if (!facultiesResponse.ok) throw new Error('Failed to fetch faculties');
        const facultiesData = await facultiesResponse.json();
        setFaculties(facultiesData);  // ไม่ต้องเพิ่ม { id: 0, name: 'ไม่จำกัด' }

       } catch (error) {
      console.error('Error fetching data:', error);
      alert('เกิดข้อผิดพลาดในการดึงข้อมูล กรุณาลองใหม่อีกครั้ง');
    }
  };
  
    fetchData();
  }, [formData.hire_type]);
 // เพิ่ม Effect สำหรับเคลียร์ฟอร์ม
 useEffect(() => {
  if (!isEditMode) {
    setFormData({
      ...defaultFormState,
      hire_type: session?.user?.role === 'employeroutside' ? 'personal' : defaultFormState.hire_type
    });
  }
}, [isEditMode, session?.user?.role]);
  // Fetch existing job data for edit mode
  useEffect(() => {
    const fetchJobData = async () => {
      if (!editId) return;

      try {
        const response = await fetch(`/api/jobs/${editId}`);
        if (!response.ok) throw new Error('Failed to fetch job details');
        const jobData = await response.json();

        // Convert date strings to Date objects
        jobData.application_start_date = jobData.application_start_date ? new Date(jobData.application_start_date) : null;
        jobData.application_end_date = jobData.application_end_date ? new Date(jobData.application_end_date) : null;
        jobData.work_start_date = jobData.work_start_date ? new Date(jobData.work_start_date) : null;
        jobData.work_end_date = jobData.work_end_date ? new Date(jobData.work_end_date) : null;

        setFormData(jobData);
      } catch (error) {
        console.error('Error fetching job details:', error);
        alert('เกิดข้อผิดพลาดในการดึงข้อมูล กรุณาลองใหม่อีกครั้ง');
      } finally {
        setLoading(false);
      }
    };

    fetchJobData();
  }, [editId]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleInstallmentChange = (index, field, value) => {
    const newInstallments = [...formData.payment_installments];
    if (!newInstallments[index]) {
      newInstallments[index] = {};
    }
    newInstallments[index][field] = value;
    setFormData(prev => ({
      ...prev,
      payment_installments: newInstallments
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate required fields
      if (!formData.title || !formData.job_description || !formData.education_level) {
        alert('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
        return;
      }

      // Format dates to ISO string
      const formattedData = {
        ...formData,
        application_start_date: formData.application_start_date?.toISOString(),
        application_end_date: formData.application_end_date?.toISOString(),
        work_start_date: formData.work_start_date?.toISOString(),
        work_end_date: formData.work_end_indefinite ? null : formData.work_end_date?.toISOString()
      };

      const url = isEditMode ? `/api/jobs/${editId}` : '/api/jobs/create';
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save job post');
      }

      alert(isEditMode ? 'แก้ไขข้อมูลสำเร็จ' : 'บันทึกข้อมูลสำเร็จ');
      router.push('/employers-dashboard/manage-jobs');
    } catch (error) {
      console.error('Error saving job post:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + error.message);
    }
  };
  if (loading) {
    return <div>กำลังโหลดข้อมูล...</div>;
  }

  return (
    <form className="default-form" onSubmit={handleSubmit}>
      <div className="row">
        {/* Hire Type Selection - Only for employer role */}
        {session?.user?.role === 'employer' && (
          <div className="form-group col-lg-12 col-md-12">
            <label>ประเภทการจ้าง *</label>
            <select
              name="hire_type"
              value={formData.hire_type}
              onChange={handleInputChange}
              required
              className="form-select"
            >
              <option value="">เลือกประเภทการจ้าง</option>
              <option value="faculty">จ้างในนามคณะ / วิทยาลัย / สถาบัน / ศูนย์</option>
              <option value="personal">จ้างส่วนบุคคล (จ้างส่วนตัว)</option>
            </select>
          </div>
        )}

        {/* Job Type Selection */}
        <div className="form-group col-lg-12 col-md-12">
          <label>ประเภทของงาน *</label>
          <select
            name="job_type_id"
            value={formData.job_type_id}
            onChange={handleInputChange}
            required
            className="form-select"
          >
            <option value="">เลือกประเภทของงาน</option>
            {jobTypes.map(type => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
            <option value="other">อื่นๆ (ระบุ)</option>
          </select>
        </div>

        {/* Other Job Type Input */}
        {formData.job_type_id === 'other' && (
          <div className="form-group col-lg-12 col-md-12">
            <label>ระบุประเภทของงานอื่นๆ *</label>
            <input
              type="text"
              name="other_job_type"
              value={formData.other_job_type}
              onChange={handleInputChange}
              required
              className="form-control"
            />
          </div>
        )}

        {/* Job Title */}
        <div className="form-group col-lg-12 col-md-12">
          <label>ชื่องาน / โครงการ *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            className="form-control"
          />
        </div>

        {/* Application Period */}
        <div className="form-group col-lg-6 col-md-12">
          <label>วันที่เปิดรับสมัคร *</label>
          <DatePicker
            selected={formData.application_start_date}
            onChange={date => setFormData(prev => ({
              ...prev,
              application_start_date: date
            }))}
            className="form-control"
            dateFormat="dd/MM/yyyy"
            minDate={new Date()}
            required
          />
        </div>

        <div className="form-group col-lg-6 col-md-12">
          <label>วันที่ปิดรับสมัคร *</label>
          <DatePicker
            selected={formData.application_end_date}
            onChange={date => setFormData(prev => ({
              ...prev,
              application_end_date: date
            }))}
            className="form-control"
            dateFormat="dd/MM/yyyy"
            minDate={formData.application_start_date}
            required
          />
        </div>

    {/* Interview Details */}
    <div className="form-group col-lg-12 col-md-12">
          <div className="checkbox-outer">
            <input
              type="checkbox"
              name="has_interview"
              checked={formData.has_interview}
              onChange={handleInputChange}
              id="has_interview"
            />
            <label htmlFor="has_interview">มีการสัมภาษณ์งาน</label>
          </div>
        </div>

        {formData.has_interview && (
          <div className="form-group col-lg-12 col-md-12">
            <label>รายละเอียดการสัมภาษณ์ *</label>
            <textarea
              name="interview_details"
              value={formData.interview_details}
              onChange={handleInputChange}
              required
              className="form-control"
              rows="3"
            />
          </div>
        )}

        {/* Work Period */}
        <div className="form-group col-lg-6 col-md-12">
          <label>วันที่เริ่มปฏิบัติงาน *</label>
          <DatePicker
            selected={formData.work_start_date}
            onChange={date => setFormData(prev => ({
              ...prev,
              work_start_date: date
            }))}
            className="form-control"
            dateFormat="dd/MM/yyyy"
            minDate={formData.application_end_date}
            required
          />
        </div>

        <div className="form-group col-lg-6 col-md-12">
          <div className="checkbox-outer mb-2">
            <input
              type="checkbox"
              name="work_end_indefinite"
              checked={formData.work_end_indefinite}
              onChange={handleInputChange}
              id="work_end_indefinite"
            />
            <label htmlFor="work_end_indefinite">ไม่มีกำหนด</label>
            </div>
          
          {!formData.work_end_indefinite && (
            <DatePicker
              selected={formData.work_end_date}
              onChange={date => setFormData(prev => ({
                ...prev,
                work_end_date: date
              }))}
              className="form-control"
              dateFormat="dd/MM/yyyy"
              minDate={formData.work_start_date}
              required={!formData.work_end_indefinite}
            />
          )}
        </div>

        {/* Work Time */}
        <div className="form-group col-lg-6 col-md-12">
          <label>เวลาเริ่มปฏิบัติงาน *</label>
          <input
            type="time"
            name="work_time_start"
            value={formData.work_time_start}
            onChange={handleInputChange}
            required
            className="form-control"
          />
        </div>

        <div className="form-group col-lg-6 col-md-12">
          <label>เวลาสิ้นสุดปฏิบัติงาน *</label>
          <input
            type="time"
            name="work_time_end"
            value={formData.work_time_end}
            onChange={handleInputChange}
            required
            className="form-control"
          />
        </div>

        {/* Work Location */}
        <div className="form-group col-lg-12 col-md-12">
          <div className="checkbox-outer mb-2">
            <input
              type="checkbox"
              name="is_online"
              checked={formData.is_online}
              onChange={handleInputChange}
              id="is_online"
            />
            <label htmlFor="is_online">ทำงานออนไลน์</label>
          </div>
          
          {!formData.is_online && (
            <div>
              <label>สถานที่ปฏิบัติงาน *</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                className="form-control"
                placeholder="ระบุสถานที่ปฏิบัติงาน"
              />
            </div>
          )}
        </div>

        {/* Compensation */}
        <div className="form-group col-lg-6 col-md-12">
          <label>ค่าตอบแทน (บาท) *</label>
          <input
            type="number"
            name="compensation_amount"
            value={formData.compensation_amount}
            onChange={handleInputChange}
            required
            min="0"
            step="0.01"
            className="form-control"
          />
        </div>

        <div className="form-group col-lg-6 col-md-12">
          <label>ต่อ *</label>
          <select
            name="compensation_period"
            value={formData.compensation_period}
            onChange={handleInputChange}
            required
            className="form-select"
          >
            <option value="">เลือกหน่วย</option>
            <option value="per_time">ครั้ง</option>
            <option value="per_hour">ชั่วโมง</option>
            <option value="per_day">วัน</option>
            <option value="per_project">โครงการ</option>
            <option value="other">อื่นๆ</option>
          </select>
        </div>

        {formData.compensation_period === 'other' && (
          <div className="form-group col-lg-12 col-md-12">
            <label>ระบุหน่วยอื่นๆ *</label>
            <input
              type="text"
              name="compensation_other"
              value={formData.compensation_other}
              onChange={handleInputChange}
              required
              className="form-control"
            />
          </div>
        )}

        {/* Project Description */}
        <div className="form-group col-lg-12 col-md-12">
          <label>รายละเอียดโครงการ</label>
          <textarea
            name="project_description"
            value={formData.project_description}
            onChange={handleInputChange}
            className="form-control"
            rows="4"
          />
        </div>

        {/* Job Description */}
        <div className="form-group col-lg-12 col-md-12">
          <label>รายละเอียดงาน *</label>
          <textarea
            name="job_description"
            value={formData.job_description}
            onChange={handleInputChange}
            required
            className="form-control"
            rows="4"
            placeholder="โปรดระบุโดยละเอียด"
          />
        </div>

        {/* Education Level */}
        <div className="form-group col-lg-12 col-md-12">
          <label>ระดับการศึกษา *</label>
          <select
            name="education_level"
            value={formData.education_level}
            onChange={handleInputChange}
            required
            className="form-select"
          >
            <option value="">เลือกระดับการศึกษา</option>
            <option value="bachelor">ปริญญาตรี</option>
            <option value="master">ปริญญาโท</option>
            <option value="phd">ปริญญาเอก</option>
          </select>
        </div>

        {/* Additional Requirements */}
        <div className="form-group col-lg-12 col-md-12">
          <label>คุณสมบัติหรือความคาดหวังอื่นๆ</label>
          <textarea
            name="additional_requirements"
            value={formData.additional_requirements}
            onChange={handleInputChange}
            className="form-control"
            rows="4"
            placeholder="เช่น ทักษะภาษา ทักษะในการใช้โปรแกรม สามารถปฏิบัติงานนอกสถานที่ได้"
          />
        </div>

        {/* Preferred Faculty */}
<div className="form-group col-lg-12 col-md-12">
  <label>คณะ / วิทยาลัย / สถาบันที่เจาะจงเป็นพิเศษ</label>
  <select
    name="preferred_faculty_id"
    value={formData.preferred_faculty_id || ''}  // เพิ่ม || '' เพื่อจัดการค่า null
    onChange={handleInputChange}
    className="form-select"
  >
    <option value="">ไม่จำกัด</option>  {/* เปลี่ยนจาก value="0" เป็น value="" */}
    {faculties.map(faculty => (
      <option key={faculty.id} value={faculty.id}>
        {faculty.name}
      </option>
    ))}
  </select>
</div>
        {/* Payment Details */}
        <div className="form-group col-lg-12 col-md-12">
          <label>รายละเอียดการจ่ายค่าจ้าง *</label>
          <select
            name="payment_type"
            value={formData.payment_type}
            onChange={handleInputChange}
            required
            className="form-select"
          >
            <option value="single">จ่ายครั้งเดียว</option>
            <option value="before_start">ก่อนเริ่มงาน</option>
            <option value="after_complete">เมื่อจบงาน</option>
            <option value="installment">จ่ายเป็นงวด</option>
          </select>
        </div>

        {formData.payment_type === 'installment' && (
          <>
            <div className="form-group col-lg-12 col-md-12">
              <label>จำนวนงวด *</label>
              <input
                type="number"
                name="installment_count"
                value={formData.installment_count}
                onChange={e => {
                  const count = Math.max(2, Math.min(12, parseInt(e.target.value) || 2));
                  setFormData(prev => ({
                    ...prev,
                    installment_count: count,
                    payment_installments: Array.from({ length: count }, () => ({
                      amount: '',
                      amount_type: ''
                    }))
                  }));
                }}
                required
                min="2"
                max="12"
                className="form-control"
              />
            </div>

            {Array.from({ length: formData.installment_count }, (_, index) => (
              <div key={index} className="row mx-0 bg-light p-3 mb-3">
                <div className="col-12">
                  <h4>งวดที่ {index + 1}</h4>
                </div>
                <div className="form-group col-lg-6 col-md-12">
                  <label>จำนวน *</label>
                  <input
                    type="number"
                    value={formData.payment_installments[index]?.amount || ''}
                    onChange={e => handleInstallmentChange(index, 'amount', e.target.value)}
                    required
                    className="form-control"
                  />
                </div>
                <div className="form-group col-lg-6 col-md-12">
                  <label>หน่วย *</label>
                  <select
                    value={formData.payment_installments[index]?.amount_type || ''}
                    onChange={e => handleInstallmentChange(index, 'amount_type', e.target.value)}
                    required
                    className="form-select"
                  >
                    <option value="">เลือกหน่วย</option>
                    <option value="percentage">เปอร์เซ็นต์ (%)</option>
                    <option value="fixed">บาท</option>
                  </select>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Submit Button */}
        <div className="form-group col-lg-12 col-md-12">
          <button type="submit" className="theme-btn btn-style-one">
            {isEditMode ? 'บันทึกการแก้ไข' : 'บันทึกข้อมูล'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default PostBoxForm;