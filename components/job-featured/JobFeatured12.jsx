'use client'

import { useState, useEffect } from "react";
import Link from "next/link";
import Slider from "react-slick";
import Image from "next/image";
import useSWR from 'swr';
import { COMPENSATION, HIRETYPE } from '@/data/unit';
import { useSession } from "next-auth/react";

const getImageUrl = (path) => {
  if (!path) return "/images/default-company-logo.png";
  let cleanPath = path.replace(/&#x2F;/g, "/");
  const filename = cleanPath.split("/").pop();
  if (!filename) return "/images/default-company-logo.png";
  return `/api/image/${filename}`;
};



const fetcher = (...args) => fetch(...args).then(res => res.json());

const JobFeatured12 = () => {
  const { data: session } = useSession();
  const { data: jobs, error, isLoading } = useSWR('/api/jobs/featured', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 60000 // รีเฟรชทุก 1 นาที
  });
  
  // เก็บข้อมูลโปรไฟล์ตามผู้โพสต์
  const [profilesData, setProfilesData] = useState({});
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);

  // ดึงข้อมูลโปรไฟล์เมื่อมีข้อมูลงาน
  useEffect(() => {
    const fetchProfiles = async () => {
      if (!jobs || jobs.length === 0) return;
      
      setIsLoadingProfiles(true);
      const profiles = {};
      
      // ดึงข้อมูลโปรไฟล์เฉพาะที่ไม่ซ้ำกัน
      const uniqueUserIds = [...new Set(jobs.map(job => job.user_id))];
      
      try {
        await Promise.all(uniqueUserIds.map(async (userId) => {
          const response = await fetch(`/api/profile/public/${userId}`);
          if (response.ok) {
            const data = await response.json();
            profiles[userId] = data;
          }
        }));
        
        setProfilesData(profiles);
      } catch (error) {
        console.error("Error fetching profiles:", error);
      } finally {
        setIsLoadingProfiles(false);
      }
    };
    
    fetchProfiles();
  }, [jobs]);

  if (isLoading || isLoadingProfiles) {
    return (
      <div className="text-center py-10">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">กำลังโหลด...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-500">
        เกิดข้อผิดพลาด: {error.message}
      </div>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className="text-center py-10">
        ไม่มีงานด่วนในขณะนี้
      </div>
    );
  }

  // กำหนดค่า settings
  const settings = {
    dots: true,
    speed: 1400,
    slidesToShow: Math.min(3, jobs.length),
    slidesToScroll: 1,
    autoplay: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 500,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  // ตรวจสอบข้อมูลซ้ำซ้อน
  const displayedIds = new Set();
  const uniqueJobs = jobs.filter(job => {
    if (displayedIds.has(job.id)) {
      return false;
    }
    displayedIds.add(job.id);
    return true;
  });

  return (
    <>
      <Slider {...settings} arrows={false}>
        {uniqueJobs.map((job) => {
          const profile = profilesData[job.user_id] || {};
          const companyName = profile.role === "employer" 
          ? profile.name 
          : profile.company_name;
          return (
            <div className="job-block-three mb-0" key={job.id}>
              <div className="inner-box">
                <div className="content">
                  
                  <span className="company-logo">
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
                  </span>
                  <h4>
                  {session?.user ? (
                    <Link href={`/job-single-v1/${job.id}`}>
                      {job.title}
                    </Link>
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
                      {companyName}
                    </li>
                    <li>
                      <span className="icon flaticon-map-locator"></span>
                      {job.location || (job.is_online ? "Remote" : "On-site")}
                    </li>
                  </ul>
                </div>

                <ul className="job-other-info">
                  <li className="time">
                    {HIRETYPE[job.hire_type]}
                  </li>
                  {job.compensation_amount && (
                    <li className="required">
                      {COMPENSATION[job.compensation_amount]} {COMPENSATION[job.compensation_period]}
                    </li>
                  )}
                </ul>

                <button className="bookmark-btn">
                  <span className="flaticon-bookmark"></span>
                </button>
              </div>
            </div>
          );
        })}
      </Slider>
    </>
  );
};

export default JobFeatured12;