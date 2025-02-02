"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useSession } from "next-auth/react";

import LoginPopup from "@/components/common/form/login/LoginPopup";
import FooterDefault from "@/components/footer/common-footer";
import DefaulHeader2 from "@/components/header/DefaulHeader2";
import MobileMenu from "@/components/header/MobileMenu";
import RelatedJobs from "@/components/job-single-pages/related-jobs/RelatedJobs";
import JobOverView from "@/components/job-single-pages/job-overview/JobOverView";
import JobSkills from "@/components/job-single-pages/shared-components/JobSkills";
import CompanyInfo from "@/components/job-single-pages/shared-components/CompanyInfo";
import MapJobFinder from "@/components/job-listing-pages/components/MapJobFinder";
import SocialTwo from "@/components/job-single-pages/social/SocialTwo";
import JobDetailsDescriptions from "@/components/job-single-pages/shared-components/JobDetailsDescriptions";
import ApplyJobModalContent from "@/components/job-single-pages/shared-components/ApplyJobModalContent";

// Utility function to handle image paths
const getImageUrl = (path) => {
  if (!path) return "/images/default-company-logo.png";

  // แปลง HTML entities
  let cleanPath = path.replace(/&#x2F;/g, "/");

  // เอาเฉพาะชื่อไฟล์
  const filename = cleanPath.split("/").pop();

  // ถ้าไม่มีชื่อไฟล์ ใช้รูป default
  if (!filename) return "/images/default-company-logo.png";

  // ส่งคืน path ที่ถูกต้อง
  return `/images/uploads/${filename}`;
};

const JobSingleDynamicV1 = ({ params }) => {
  const { data: session } = useSession();
  const [jobPost, setJobPost] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchJobAndProfileData = async () => {
      if (!session) return;

      try {
        // Fetch job post data
        const jobResponse = await fetch(`/api/jobs/${params.id}`);
        const jobData = await jobResponse.json();

        // Fetch profile data of the job poster
        const profileResponse = await fetch(`/api/profile/${jobData.user_id}`);
        const profileData = await profileResponse.json();

        setJobPost(jobData);
        setProfileData(profileData);
      } catch (error) {
        console.error("Error fetching job and profile data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      fetchJobAndProfileData();
    }
  }, [session, params.id]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!jobPost || !profileData) {
    return <div>Job not found</div>;
  }

  // Render company logo and information based on profile role
  const renderCompanyInfo = () => {
    let companyLogo, companyName, companyDetails;

    if (profileData.role === "employer") {
      companyLogo = profileData.company_logo;
      companyName = `${profileData.title} ${profileData.name}`;
      companyDetails = [
        { icon: "flaticon-briefcase", text: profileData.department },
        { icon: "flaticon-map-locator", text: profileData.position },
      ];
    } else if (profileData.role === "employeroutside") {
      companyLogo = profileData.company_logo;
      companyName = profileData.company_name;
      companyDetails = [
        { icon: "flaticon-map-locator", text: profileData.company_address },
        { icon: "flaticon-phone", text: profileData.company_phone },
      ];
    } else {
      companyLogo = null;
      companyName = "Unknown Employer";
      companyDetails = [];
    }

    return (
      <div className="content">
        <span className="company-logo">
          <Image
            width={100}
            height={98}
            src={getImageUrl(profileData.company_logo)}
            alt="company logo"
            unoptimized
            className="object-cover"
          />
        </span>
        <h4>{jobPost.title}</h4>

        <ul className="job-info">
          <li>
            <span className="icon flaticon-briefcase"></span>
            {companyName}
          </li>
          {companyDetails.map((detail, index) => (
            <li key={index}>
              <span className={`icon ${detail.icon}`}></span>
              {detail.text}
            </li>
          ))}
          <li>
            <span className="icon flaticon-money"></span>
            {jobPost.compensation_amount} {jobPost.compensation_period}
          </li>
        </ul>
      </div>
    );
  };

  return (
    <>
      <span className="header-span"></span>

      <LoginPopup />
      <DefaulHeader2 />
      <MobileMenu />

      <section className="job-detail-section">
        <div className="upper-box">
          <div className="auto-container">
            <div className="job-block-seven">
              <div className="inner-box">
                {renderCompanyInfo()}

                <div className="btn-box">
                  <a
                    href="#"
                    className="theme-btn btn-style-one"
                    data-bs-toggle="modal"
                    data-bs-target="#applyJobModal"
                  >
                    Apply For Job
                  </a>
                  <button className="bookmark-btn">
                    <i className="flaticon-bookmark"></i>
                  </button>
                </div>

                {/* Apply Job Modal */}
                <div
                  className="modal fade"
                  id="applyJobModal"
                  tabIndex="-1"
                  aria-hidden="true"
                >
                  <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                    <div className="apply-modal-content modal-content">
                      <div className="text-center">
                        <h3 className="title">Apply for this job</h3>
                        <button
                          type="button"
                          className="closed-modal"
                          data-bs-dismiss="modal"
                          aria-label="Close"
                        ></button>
                      </div>

                      <ApplyJobModalContent />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="job-detail-outer">
          <div className="auto-container">
            <div className="row">
              <div className="content-column col-lg-8 col-md-12 col-sm-12">
                <JobDetailsDescriptions jobPost={jobPost} />

                <div className="other-options">
                  <div className="social-share">
                    <h5>Share this job</h5>
                    <SocialTwo />
                  </div>
                </div>

                <div className="related-jobs">
                  <div className="title-box">
                    <h3>Related Jobs</h3>
                    <div className="text">
                      2020 jobs live - 293 added today.
                    </div>
                  </div>

                  <RelatedJobs />
                </div>
              </div>

              <div className="sidebar-column col-lg-4 col-md-12 col-sm-12">
                <aside className="sidebar">
                  <div className="sidebar-widget">
                    <h4 className="widget-title">Job Overview</h4>
                    <JobOverView jobPost={jobPost} />

                    <h4 className="widget-title mt-5">Job Location</h4>
                    {/* <div className="widget-content">
                      <div className="map-outer">
                        <div style={{ height: "300px", width: "100%" }}>
                          <MapJobFinder location={jobPost.location} />
                        </div>
                      </div>
                    </div>

                    <h4 className="widget-title">Job Skills</h4>
                    <div className="widget-content">
                      <JobSkills />
                    </div> */}
                  </div>

                  <div className="sidebar-widget company-widget">
                    <div className="widget-content">
                      <div className="company-title">
                        <div className="company-logo">
                          <Image
                            width={54}
                            height={53}
                            src={getImageUrl(profileData.company_logo)}
                            alt="company logo"
                            unoptimized
                            className="object-cover"
                          />
                        </div>
                        <h5 className="company-name">
                          {profileData.role === "employer"
                            ? `${profileData.title} ${profileData.name}`
                            : profileData.company_name}
                        </h5>
                        <a href="#" className="profile-link">
                          View company profile
                        </a>
                      </div>

                      <CompanyInfo profileData={profileData} />
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FooterDefault footerStyle="alternate5" />
    </>
  );
};

export default dynamic(() => Promise.resolve(JobSingleDynamicV1), {
  ssr: false,
});
