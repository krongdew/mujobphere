'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import dynamic from "next/dynamic";
import LoginPopup from "@/components/common/form/login/LoginPopup";
import FooterDefault from "@/components/footer/common-footer";
import DefaulHeader from "@/components/header/DefaulHeader2";
import MobileMenu from "@/components/header/MobileMenu";
import Contact from "@/components/candidates-single-pages/shared-components/Contact";
import Social from "@/components/candidates-single-pages/social/Social";
import JobSkills from "@/components/candidates-single-pages/shared-components/JobSkills";
import Image from "next/image";

const getImageUrl = (path) => {
  if (!path) return "/images/default-company-logo.png";
  let cleanPath = path.replace(/&#x2F;/g, "/");
  const filename = cleanPath.split("/").pop();
  if (!filename) return "/images/default-company-logo.png";
  return `/api/image/${filename}`;
};

const CandidateSingleDynamicV1 = ({ params }) => {
  const { data: session } = useSession();
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!session) {
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching student data for ID:', params.studentUserId);
        const response = await fetch(`/api/student/profile/${params.studentUserId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch student data');
        }
        const data = await response.json();
        console.log('Received student data:', data);
        setStudentData(data);
      } catch (error) {
        console.error('Error fetching student data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, params.studentUserId]);

  if (!session) {
    return (
      <div className="text-center py-10">
        <h2>Please login to view profile</h2>
        <LoginPopup />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-500">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="text-center py-10">
        <p>No profile data found</p>
      </div>
    );
  }

  return (
    <>
      <span className="header-span"></span>
      <LoginPopup />
      <DefaulHeader />
      <MobileMenu />

      <section className="candidate-detail-section">
        <div className="upper-box">
          <div className="auto-container">
            <div className="candidate-block-five">
              <div className="inner-box">
                <div className="content">
                  <figure className="image">
                    <Image
                      width={100}
                      height={100}
                      src={getImageUrl(studentData.profile?.img_student) || '/images/placeholder.jpg'}
                      alt="profile"
                    />
                  </figure>
                  <h4 className="name">{studentData.name}</h4>

                  <ul className="candidate-info">
                    <li className="designation">{studentData.profile?.major}</li>
                    <li>
                      <span className="icon flaticon-map-locator"></span>
                      {studentData.faculty}
                    </li>
                    <li>
                      <span className="icon flaticon-money"></span>
                      GPA: {studentData.profile?.gpa || 'N/A'}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="candidate-detail-outer">
          <div className="auto-container">
            <div className="row">
              <div className="content-column col-lg-8 col-md-12 col-sm-12">
                <div className="job-detail">
                  <h4>About Me</h4>
                  <p>{studentData.profile?.description}</p>

                  {/* Education Section */}
                  <div className="resume-outer">
                    <div className="upper-title">
                      <h4>Education</h4>
                    </div>
                    {studentData.education?.map((edu) => (
                      <div key={edu.id} className="resume-block">
                        <div className="inner">
                          <span className="name">{edu.school_name[0]}</span>
                          <div className="title-box">
                            <div className="info-box">
                              <h3>{edu.degree}</h3>
                              <span>{edu.school_name}</span>
                            </div>
                            <div className="edit-box">
                              <span className="year">
                                {new Date(edu.start_date).getFullYear()} - 
                                {edu.end_date ? new Date(edu.end_date).getFullYear() : 'Present'}
                              </span>
                            </div>
                          </div>
                          <div className="text">{edu.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Experience Section */}
                  <div className="resume-outer theme-blue">
                    <div className="upper-title">
                      <h4>Work Experience</h4>
                    </div>
                    {studentData.experience?.map((exp) => (
                      <div key={exp.id} className="resume-block">
                        <div className="inner">
                          <span className="name">{exp.company_name[0]}</span>
                          <div className="title-box">
                            <div className="info-box">
                              <h3>{exp.position}</h3>
                              <span>{exp.company_name}</span>
                            </div>
                            <div className="edit-box">
                              <span className="year">
                                {new Date(exp.start_date).getFullYear()} - 
                                {exp.end_date ? new Date(exp.end_date).getFullYear() : 'Present'}
                              </span>
                            </div>
                          </div>
                          <div className="text">{exp.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Awards Section */}
                  <div className="resume-outer theme-yellow">
                    <div className="upper-title">
                      <h4>Awards</h4>
                    </div>
                    {studentData.awards?.map((award) => (
                      <div key={award.id} className="resume-block">
                        <div className="inner">
                          <span className="name">{award.title[0]}</span>
                          <div className="title-box">
                            <div className="info-box">
                              <h3>{award.title}</h3>
                              <span>{award.issuer}</span>
                            </div>
                            <div className="edit-box">
                              <span className="year">
                                {new Date(award.date_received).getFullYear()}
                              </span>
                            </div>
                          </div>
                          <div className="text">{award.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="sidebar-column col-lg-4 col-md-12 col-sm-12">
                <aside className="sidebar">
                  <div className="sidebar-widget">
                    <div className="widget-content">
                      <ul className="job-overview">
                        <li>
                          <i className="icon icon-calendar"></i>
                          <h5>Birth Date:</h5>
                          <span>
                            {studentData.profile?.birth_date ? 
                              new Date(studentData.profile.birth_date).toLocaleDateString() : 
                              'N/A'}
                          </span>
                        </li>

                        <li>
                          <i className="icon icon-degree"></i>
                          <h5>Education Level:</h5>
                          <span>
                            {studentData.education?.[0]?.degree || 'N/A'}
                          </span>
                        </li>

                        <li>
                          <i className="icon icon-language"></i>
                          <h5>Language Skills:</h5>
                          <span>{studentData.profile?.language_skills || 'N/A'}</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="sidebar-widget">
                    <h4 className="widget-title">Professional Skills</h4>
                    <div className="widget-content">
                      <div className="skills-list">
                        {studentData.profile?.programming_skills?.split(',').map((skill, index) => (
                          <span key={index} className="skill-tag">{skill.trim()}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="sidebar-widget contact-widget">
  <h4 className="widget-title">Contact Information</h4>
  <div className="widget-content">
    <div className="default-form">
      <div className="form-group">
        <label><i className="icon icon-envelope"></i> Email:</label>
        <div className="field-text">
          {studentData.email || 'N/A'}
        </div>
      </div>
      
      <div className="form-group">
        <label><i className="icon icon-phone"></i> Phone:</label>
        <div className="field-text">
          {studentData.profile?.phone || 'N/A'}
        </div>
      </div>
      
      <div className="form-group">
        <label><i className="icon icon-map-pin"></i> Address:</label>
        <div className="field-text">
          {studentData.profile?.address || 'N/A'}
        </div>
      </div>

      {/* ถ้ามี CV file ให้แสดงปุ่มดาวน์โหลด */}
      {studentData.profile?.cv_file && (
        <div className="form-group">
          <a 
            href={`/api/file/${studentData.profile.cv_file}`}
            className="theme-btn btn-style-one w-100 text-center"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="icon icon-download"></i> Download CV
          </a>
        </div>
      )}
    </div>
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

export default dynamic(() => Promise.resolve(CandidateSingleDynamicV1), {
  ssr: false,
});