'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Link from "next/link";
import Image from "next/image";

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

  // Fetch job types
  useEffect(() => {
    const fetchJobTypes = async () => {
      try {
        const hireTypes = ['personal', 'faculty'];
        const allJobTypes = [];

        for (const hireType of hireTypes) {
          const response = await fetch(`/api/job-types?hire_type=${hireType}`);
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          allJobTypes.push(...data);
        }

        // Group job types
        const groupedJobTypes = allJobTypes.reduce((acc, type) => {
          const existingType = acc.find(t => t.name === type.name);
          
          if (existingType) {
            // Add hire type if not already present
            if (!existingType.hire_types.includes(type.hire_type)) {
              existingType.hire_types.push(type.hire_type);
            }
            // Add type ID if not already present
            if (!existingType.type_ids.includes(type.id)) {
              existingType.type_ids.push(type.id);
            }
          } else {
            // Create new grouped type
            acc.push({
              name: type.name,
              hire_types: [type.hire_type],
              type_ids: [type.id]
            });
          }
          
          return acc;
        }, []);

        setJobTypes(groupedJobTypes);
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
        setLoading(false);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = jobs;

    // Comprehensive Keyword filter
    if (keyword) {
      const lowercaseKeyword = keyword.toLowerCase();
      result = result.filter(job => {
        const title = job.title || '';
        const location = job.location || '';
        
        return title.toLowerCase().includes(lowercaseKeyword) || 
               location.toLowerCase().includes(lowercaseKeyword);
      });
    }

    // Category filter (Job Type)
    if (category) {
      result = result.filter(job => {
        const matchingJobTypes = jobTypes.find(type => 
          type.type_ids.includes(job.job_type_id) && 
          type.type_ids.includes(Number(category))
        );
        
        return !!matchingJobTypes;
      });
    }

    // Job Type filter
    if (jobType && jobType.length > 0) {
      result = result.filter(job => {
        const matchingJobTypes = jobTypes.find(type => 
          type.type_ids.includes(job.job_type_id) && 
          jobType.some(selectedTypeId => 
            type.type_ids.includes(Number(selectedTypeId))
          )
        );
        
        return !!matchingJobTypes;
      });
    }

    // Salary filter
    result = result.filter(job => 
      job.compensation_amount >= salary.min && 
      job.compensation_amount <= salary.max
    );

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

      result = result.filter(job => 
        new Date(job.created_at) >= filterDate
      );
    }

    setFilteredJobs(result);
  }, [jobs, jobTypes, keyword, category, jobType, salary, hireType, educationLevel, location, datePosted]);

  if (loading) {
    return <div>กำลังโหลดข้อมูล...</div>;
  }

  return (
    <div className="job-listing-section">
      {/* Job Listings */}
      <div className="job-listings">
        {filteredJobs.slice(0, 20).map(job => (
          <div key={job.id} className="job-block">
            <div className="inner-box">
              <div className="content">
                <h4>
                  <Link href={`/job-single-v1/${job.id}`}>{job.title}</Link>
                </h4>
                <ul className="job-info">
                  <li>
                    <span className="icon flaticon-briefcase"></span>
                    {job.compensation_amount} บาท/{job.compensation_period}
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
        ))}
      </div>

      {/* Pagination or Load More */}
      {filteredJobs.length > 20 && (
        <div className="text-center mt-4">
          <button className="btn btn-primary">โหลดเพิ่มเติม</button>
        </div>
      )}

      {/* No Results Message */}
      {filteredJobs.length === 0 && (
        <div className="text-center mt-4">
          <p>ไม่พบข้อมูลงาน</p>
        </div>
      )}
    </div>
  );
};

export default FilterJobsBox;