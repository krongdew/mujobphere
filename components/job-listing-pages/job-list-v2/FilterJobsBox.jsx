'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from "next/link";

const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

const FilterJobsBox = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobTypes, setJobTypes] = useState([]);

  // Get filters from Redux
  const {
    keyword,
    location,
    category,
    jobType,
    datePosted,
    experience,
    salary,
    tag,
    hireType,
    educationLevel
  } = useSelector((state) => state.filter.jobList);

  // Fetch job types - ใช้ API endpoint เดียวกับที่เราปรับปรุงไปก่อนหน้า
  useEffect(() => {
    const fetchJobTypes = async () => {
      try {
        const response = await fetch('/api/job-types-all');
        if (!response.ok) throw new Error('Failed to fetch job types');
        
        const data = await response.json();

        // Group job types with the same structure as before
        const groupedTypes = data.reduce((acc, type) => {
          const existingType = acc.find(t => t.name === type.name);
          if (existingType) {
            if (!existingType.hire_types.includes(type.hire_type)) {
              existingType.hire_types.push(type.hire_type);
            }
            if (!existingType.type_ids.includes(type.id)) {
              existingType.type_ids.push(type.id);
            }
          } else {
            acc.push({
              name: type.name,
              hire_types: [type.hire_type],
              type_ids: [type.id]
            });
          }
          return acc;
        }, []);

        setJobTypes(groupedTypes);
      } catch (error) {
        console.error('Error fetching job types:', error);
      }
    };

    fetchJobTypes();
  }, []);

  // Fetch jobs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch('/api/jobs/public');
        if (!response.ok) throw new Error('Failed to fetch jobs');
        const data = await response.json();
        setJobs(data);
        setFilteredJobs(data); // Set initial filtered jobs
        setLoading(false);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Apply filters - แยกฟังก์ชันการกรองให้ชัดเจนขึ้น
  useEffect(() => {
    if (!jobs.length || !jobTypes.length) return;

    const applyFilters = () => {
      let result = [...jobs];

      // Keyword filter
      if (keyword) {
        const lowercaseKeyword = keyword.toLowerCase();
        result = result.filter(job => {
          const title = (job.title || '').toLowerCase();
          const location = (job.location || '').toLowerCase();
          return title.includes(lowercaseKeyword) || location.includes(lowercaseKeyword);
        });
      }

      // Category filter (Single job type)
      if (category) {
        result = result.filter(job => {
          const jobTypeMatch = jobTypes.find(type => 
            type.type_ids.includes(Number(category)) && 
            type.type_ids.includes(job.job_type_id)
          );
          return Boolean(jobTypeMatch);
        });
      }

      // Multiple job types filter
      if (jobType && jobType.length > 0) {
        result = result.filter(job => {
          return jobType.some(selectedTypeId => {
            const jobTypeMatch = jobTypes.find(type => 
              type.type_ids.includes(Number(selectedTypeId)) && 
              type.type_ids.includes(job.job_type_id)
            );
            return Boolean(jobTypeMatch);
          });
        });
      }

      // Salary filter - ตรวจสอบว่ามีค่า min และ max ก่อน
      if (salary && typeof salary.min === 'number' && typeof salary.max === 'number') {
        result = result.filter(job => 
          job.compensation_amount >= salary.min && 
          job.compensation_amount <= salary.max
        );
      }

      // Hire Type filter
      if (hireType) {
        result = result.filter(job => job.hire_type === hireType);
      }

      // Education Level filter
      if (educationLevel) {
        result = result.filter(job => job.education_level === educationLevel);
      }

      // Location filter
      if (location) {
        if (location === 'online') {
          result = result.filter(job => job.is_online === true);
        } else if (location === 'onsite') {
          result = result.filter(job => job.is_online === false);
        }
      }

      // Date Posted filter
      if (datePosted && datePosted !== 'all') {
        const now = new Date();
        const filterDate = new Date();
        
        switch(datePosted) {
          case 'last_24h':
            filterDate.setHours(now.getHours() - 24);
            break;
          case 'last_3_days':
            filterDate.setDate(now.getDate() - 3);
            break;
          case 'last_7_days':
            filterDate.setDate(now.getDate() - 7);
            break;
          case 'last_14_days':
            filterDate.setDate(now.getDate() - 14);
            break;
        }

        result = result.filter(job => new Date(job.created_at) >= filterDate);
      }

      return result;
    };

    const filtered = applyFilters();
    setFilteredJobs(filtered);
  }, [jobs, jobTypes, keyword, category, jobType, salary, hireType, educationLevel, location, datePosted]);

  if (loading) {
    return (
      <div className="text-center p-4">
        <div className="animate-pulse">กำลังโหลดข้อมูล...</div>
      </div>
    );
  }
  


  return (
    <div className="job-listing-section">
      {/* Job Listings */}
      <div className="job-listings">
        {filteredJobs.length > 0 ? (
          filteredJobs.slice(0, 20).map(job => (
            <div key={job.id} className="job-block">
              <div className="inner-box">
                <div className="content">
                <h4>
                    {session.user ? (
                      // ถ้า login แล้วให้ navigate ไปที่หน้ารายละเอียด
                      <a 
                        href={`/job-single-v1/${job.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          router.push(`/job-single-v1/${job.id}`);
                        }}
                      >
                        {job.title}
                      </a>
                    ) : (
                      // ถ้ายังไม่ได้ login ให้เปิด modal
                      <a 
                        href="#"
                        data-bs-toggle="modal"
                        data-bs-target="#loginPopupModal"
                        onClick={(e) => e.preventDefault()}
                      >
                        {job.title}
                      </a>
                    )}
                  </h4>
                  <ul className="job-info">
                    <li>
                      <span className="icon flaticon-briefcase"></span>
                      {job.compensation_amount?.toLocaleString()} บาท/{job.compensation_period}
                    </li>
                    <li>
                      <span className="icon flaticon-map-locator"></span>
                      {job.is_online ? 'ออนไลน์' : job.location}
                    </li>
                    <li>
                      <span className="icon flaticon-clock-3"></span>
                      {formatDate(job.application_start_date)} - {formatDate(job.application_end_date)}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center p-4">
            <p>ไม่พบข้อมูลงานที่ตรงกับเงื่อนไขการค้นหา</p>
          </div>
        )}
      </div>

      {/* Pagination or Load More */}
      {filteredJobs.length > 20 && (
        <div className="text-center mt-4">
          <button className="btn btn-primary">โหลดเพิ่มเติม</button>
        </div>
      )}
    </div>
  );
};

export default FilterJobsBox;