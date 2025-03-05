"use client";

import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { COMPENSATION } from "@/data/unit";

const getImageUrl = (path) => {
  if (!path) return "/images/default-company-logo.png";
  let cleanPath = path.replace(/&#x2F;/g, "/");
  const filename = cleanPath.split("/").pop();
  if (!filename) return "/images/default-company-logo.png";
  return `/api/image/${filename}`;
};

// ฟังก์ชันจัดรูปแบบวันที่
const formatDate = (dateString) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
};

const FilterJobsBox = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobTypes, setJobTypes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // เก็บข้อมูลโปรไฟล์ตามผู้โพสต์
  const [profilesData, setProfilesData] = useState({});
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);

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
    educationLevel,
  } = useSelector((state) => state.filter.jobList);

  // สร้าง query string จาก filters
  const createQueryString = useCallback(() => {
    const params = new URLSearchParams();

    // เพิ่ม pagination params
    params.append("page", currentPage);
    params.append("pageSize", pageSize);

    // เพิ่ม filter params ถ้ามีค่า
    if (keyword) params.append("keyword", keyword);
    if (location) params.append("location", location);
    if (category) params.append("category", category);
    if (jobType && jobType.length) params.append("jobType", jobType.join(","));
    if (datePosted && datePosted !== "all")
      params.append("datePosted", datePosted);
    if (salary && typeof salary.min === "number")
      params.append("salaryMin", salary.min);
    if (salary && typeof salary.max === "number")
      params.append("salaryMax", salary.max);
    if (hireType) params.append("hireType", hireType);
    if (educationLevel) params.append("educationLevel", educationLevel);

    return params.toString();
  }, [
    currentPage,
    pageSize,
    keyword,
    location,
    category,
    jobType,
    datePosted,
    salary,
    hireType,
    educationLevel,
  ]);

  // Fetch job types
  useEffect(() => {
    const fetchJobTypes = async () => {
      try {
        const response = await fetch("/api/job-types-all");
        if (!response.ok) throw new Error("Failed to fetch job types");

        const data = await response.json();

        // Group job types with the same structure as before
        const groupedTypes = data.reduce((acc, type) => {
          const existingType = acc.find((t) => t.name === type.name);
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
              type_ids: [type.id],
            });
          }
          return acc;
        }, []);

        setJobTypes(groupedTypes);
      } catch (error) {
        console.error("Error fetching job types:", error);
      }
    };

    fetchJobTypes();
  }, []);

  // Fetch jobs with pagination and filters
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        // สร้าง query string จาก filters
        const queryString = createQueryString();
        console.log("Query string:", queryString); // Debug
        
        const response = await fetch(`/api/jobs/public?${queryString}`);

        if (!response.ok) throw new Error("Failed to fetch jobs");

        const data = await response.json();
        console.log("API Response:", data); // Debug
        
        if (data.jobs && Array.isArray(data.jobs)) {
          setJobs(data.jobs);
          if (data.pagination) {
            setCurrentPage(data.pagination.currentPage || 1);
            setTotalPages(data.pagination.totalPages || 1);
            setTotalItems(data.pagination.totalItems || 0);
          }
        } else {
          console.error("Invalid API response format:", data);
          setJobs([]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        setLoading(false);
        setJobs([]);
      }
    };

    fetchJobs();
  }, [createQueryString]);

  // ดึงข้อมูลโปรไฟล์เมื่อมีข้อมูลงาน - เปลี่ยนมาใช้ API endpoint แบบไม่ต้องการ authentication
  useEffect(() => {
    const fetchProfiles = async () => {
      if (!jobs || jobs.length === 0) return;
      
      setIsLoadingProfiles(true);
      const profiles = {};
      
      try {
        // รวบรวม user_id ที่ไม่ซ้ำและไม่เป็น undefined/null
        const userIds = [];
        jobs.forEach(job => {
          if (job.user_id && !userIds.includes(job.user_id)) {
            userIds.push(job.user_id);
          }
        });
        
        // ดึงข้อมูลโปรไฟล์แบบทีละรายการ (ไม่ใช้ Promise.all)
        for (const userId of userIds) {
          try {
            // เปลี่ยนเส้นทาง API เป็น public endpoint ที่ไม่ต้องการ authentication
            const response = await fetch(`/api/profile/public-noauth/${userId}`);
            if (response.ok) {
              const data = await response.json();
              profiles[userId] = data;
            }
          } catch (err) {
            console.error(`Error fetching profile for user ${userId}:`, err);
          }
        }
        
        setProfilesData(profiles);
      } catch (error) {
        console.error("Error fetching profiles:", error);
      } finally {
        setIsLoadingProfiles(false);
      }
    };
    
    fetchProfiles();
  }, [jobs]);

  // Handle page change
  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      // Scroll to top of the jobs list
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [totalPages]);

  // เพิ่มตัวเลือกจำนวนรายการต่อหน้า
  const handlePageSizeChange = useCallback((newSize) => {
    setPageSize(newSize);
    setCurrentPage(1); // รีเซ็ตกลับไปหน้าแรกเมื่อเปลี่ยนจำนวนรายการต่อหน้า
  }, []);

  if (loading && jobs.length === 0) {
    return (
      <div className="text-center p-4">
        <div className="animate-pulse">Jobs Data Loading...</div>
      </div>
    );
  }

  return (
    <div className="job-listing-section">
      {/* แสดงจำนวนงานที่พบและตัวเลือกจำนวนต่อหน้า */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <p>พบงานทั้งหมด {totalItems} งาน</p>
        <div className="page-size-selector d-flex align-items-center">
          <span className="me-2">แสดง:</span>
          <select 
            className="form-select form-select-sm" 
            style={{ width: 'auto' }}
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="ms-2">รายการต่อหน้า</span>
        </div>
      </div>

      {/* Job Listings */}
      <div className="job-listings">
        {jobs.length > 0 ? (
          jobs.map((job) => {
            // ดึงข้อมูลโปรไฟล์ของผู้โพสต์งานนี้ (ถ้ามี)
            const profile = job.user_id ? profilesData[job.user_id] || {} : {};
            const companyName = profile.role === "employer" 
              ? profile.name 
              : profile.company_name || "บริษัทไม่เปิดเผยชื่อ";
            
            return (
              <div key={job.id} className="job-block-three mb-0">
                <div className="inner-box">
                  <div className="content">
                    <div className="company-logo me-3">
                      <Image
                        width={50}
                        height={50}
                        src={getImageUrl(profile.company_logo)}
                        alt="company logo"
                        unoptimized
                        className="object-cover"
                        onError={(e) => {
                          e.target.src = "/images/default-company-logo.png";
                        }}
                      />
                    </div>
                    <div>
                      <h4>
                        {session?.user ? (
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
                      <p className="company-name mb-2">{companyName}</p>
                      <ul className="job-info">
                        <li>
                          <span className="icon flaticon-briefcase"></span>
                          {job.compensation_amount?.toLocaleString()} บาท/
                          {COMPENSATION[job.compensation_period] || job.compensation_period}
                        </li>
                        <li>
                          <span className="icon flaticon-map-locator"></span>
                          {job.is_online ? "ออนไลน์" : job.location}
                        </li>
                        <li>
                          <span className="icon flaticon-clock-3"></span>
                          {formatDate(job.application_start_date)} -{" "}
                          {formatDate(job.application_end_date)}
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center p-4">
            <p>ไม่พบข้อมูลงานที่ตรงกับเงื่อนไขการค้นหา</p>
            <p>No job information found that matches the search criteria.</p>
          </div>
        )}
      </div>

      {/* Pagination - แบบปุ่มเลขหน้า */}
      {totalPages > 1 && (
        <div className="pagination-box mt-4">
          <nav className="ls-pagination">
            <ul>
              {/* ปุ่มย้อนกลับ */}
              <li className={`pager ${currentPage === 1 ? "disabled" : ""}`}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(currentPage - 1);
                  }}
                  className={currentPage === 1 ? "disabled" : ""}
                >
                  <span className="icon flaticon-left-arrow"></span>
                </a>
              </li>
  
              {/* สร้างปุ่มตัวเลขหน้า */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // คำนวณว่าควรแสดงหน้าไหนบ้าง
                let pageNum;
                if (totalPages <= 5) {
                  // ถ้ามีไม่เกิน 5 หน้า แสดงทุกหน้า
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  // ถ้าอยู่ใกล้หน้าแรก
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  // ถ้าอยู่ใกล้หน้าสุดท้าย
                  pageNum = totalPages - 4 + i;
                } else {
                  // อยู่ตรงกลาง
                  pageNum = currentPage - 2 + i;
                }
  
                return (
                  <li key={i}>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(pageNum);
                      }}
                      className={currentPage === pageNum ? "current" : ""}
                    >
                      {pageNum}
                    </a>
                  </li>
                );
              })}
  
              {/* ปุ่มไปหน้าถัดไป */}
              <li
                className={`pager ${
                  currentPage === totalPages ? "disabled" : ""
                }`}
              >
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(currentPage + 1);
                  }}
                  className={currentPage === totalPages ? "disabled" : ""}
                >
                  <span className="icon flaticon-right-arrow"></span>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
};

export default FilterJobsBox;