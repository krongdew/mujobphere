"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useSession } from "next-auth/react";
import LoginPopup from "@/components/common/form/login/LoginPopup";
import FooterDefault from "@/components/footer/common-footer";
import DefaulHeader2 from "@/components/header/DefaulHeader2";
import MobileMenu from "@/components/header/MobileMenu";
import JobOverView from "@/components/job-single-pages/job-overview/JobOverView";
import CompanyInfo from "@/components/job-single-pages/shared-components/CompanyInfo";
import JobDetailsDescriptions from "@/components/job-single-pages/shared-components/JobDetailsDescriptions";
import ApplyJobModalContent from "@/components/job-single-pages/shared-components/ApplyJobModalContent";
import { COMPENSATION } from '@/data/unit';

const getImageUrl = (path) => {
  if (!path) return "/images/default-company-logo.png";
  let cleanPath = path.replace(/&#x2F;/g, "/");
  const filename = cleanPath.split("/").pop();
  if (!filename) return "/images/default-company-logo.png";
  return `/api/image/${filename}`;
};


const JobSingleDynamicV1 = ({ params }) => {
  const { data: session } = useSession();
  const [jobPost, setJobPost] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    const fetchJobAndProfileData = async () => {
      if (!session) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch job post data
        const jobResponse = await fetch(`/api/jobs/${params.id}`);
        if (!jobResponse.ok) {
          throw new Error('Failed to fetch job data');
        }
        const jobData = await jobResponse.json();

        // Fetch profile data
        const profileResponse = await fetch(`/api/profile/public/${jobData.user_id}`);
        if (!profileResponse.ok) {
          throw new Error('Failed to fetch profile data');
        }
        const profileData = await profileResponse.json();

        // Check if user has already applied (for students only)
        if (session.user.role === 'student') {
          const applicationResponse = await fetch(
            `/api/job-applications/check/${params.id}`
          );
          if (applicationResponse.ok) {
            const { hasApplied } = await applicationResponse.json();
            setHasApplied(hasApplied);
          }
        }

        setJobPost(jobData);
        setProfileData(profileData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobAndProfileData();
  }, [session, params.id]);

  if (!session) {
    return (
      <div className="text-center py-10">
        <h2>Please login to view job details</h2>
        <LoginPopup />
      </div>
    );
  }

  if (isLoading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-10">Error: {error}</div>;
  }

  if (!jobPost || !profileData) {
    return <div className="text-center py-10">Job information not available. Please try again.</div>;
  }

  const CompanySection = () => {
    if (!profileData) return <div>Loading company information...</div>;
    
    const companyLogo = profileData.company_logo || "";
    const companyName = profileData.role === "employer" 
      ? profileData.name 
      : profileData.company_name || "";

    const companyDetails = [
      {
        icon: "flaticon-briefcase",
        text: jobPost && jobPost.is_online ? 'ออนไลน์' : 'onsite'
      },
      {
        icon: "flaticon-map-locator",
        text: profileData.role === "employer" 
          ? (profileData.department || "")
          : (profileData.company_address || "")
      }
    ];

    if (jobPost && jobPost.compensation_amount) {
      companyDetails.push({
        icon: "flaticon-money",
        text: `${jobPost.compensation_amount} ${COMPENSATION[jobPost.compensation_period] || ""}`
      });
    }
    
    return (
      <div className="content">
        <span className="company-logo">
          <Image
            width={100}
            height={98}
            src={getImageUrl(companyLogo)}
            alt="company logo"
            unoptimized
            className="object-cover"
          />
        </span>
        <h4>{jobPost ? jobPost.title : "Job Title"}</h4>

        <ul className="job-info">
          {companyDetails.map((detail, index) => (
            <li key={index}>
              <span className={`icon ${detail.icon}`}></span>
              {detail.text}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderApplyButton = () => {
    if (!session) {
      return (
        <button
          className="theme-btn btn-style-one"
          data-bs-toggle="modal"
          data-bs-target="#loginModal"
        >
          Login to Apply
        </button>
      );
    }

    if (session.user.role !== 'student') {
      return null;
    }

    if (hasApplied) {
      return (
        <button className="theme-btn btn-style-one disabled" disabled>
          Already Applied
        </button>
      );
    }

    return (
      <button
        className="theme-btn btn-style-one"
        data-bs-toggle="modal"
        data-bs-target="#applyJobModal"
      >
        Apply For Job
      </button>
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
                <CompanySection />

                <div className="btn-box">
                  {renderApplyButton()}
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
                      {jobPost && (
                        <ApplyJobModalContent jobId={jobPost.id} />
                      )}
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
              </div>

              <div className="sidebar-column col-lg-4 col-md-12 col-sm-12">
                <aside className="sidebar">
                  <div className="sidebar-widget">
                    <h4 className="widget-title">Job Overview</h4>
                    {jobPost && <JobOverView jobPost={jobPost} />}
                  </div>

                  {profileData && (
                    <div className="sidebar-widget company-widget">
                      <div className="widget-content">
                        <div className="company-title">
                          <div className="company-logo">
                            <Image
                              width={54}
                              height={53}
                              src={getImageUrl(profileData.company_logo || "")}
                              alt="company logo"
                              unoptimized
                              className="object-cover"
                            />
                          </div>
                          <h5 className="company-name">
                            {profileData.role === "employer"
                              ? `${profileData.title || ""} ${profileData.name || ""}`
                              : (profileData.company_name || "")}
                          </h5>
                        </div>
                        <CompanyInfo profileData={profileData} />
                      </div>
                    </div>
                  )}
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