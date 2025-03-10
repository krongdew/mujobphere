import { useSession } from 'next-auth/react';
import MobileMenu from "../../../header/MobileMenu";
import DashboardHeader from "../../../header/DashboardHeader";
import LoginPopup from "../../../common/form/login/LoginPopup";
import DashboardEmployerSidebar from "../../../header/DashboardEmployerSidebar";
import DashboardAdminSidebar from "../../../header/DashboardAdminSidebar";
import BreadCrumb from "../../BreadCrumb";
import CopyrightFooter from "../../CopyrightFooter";
import PostBoxForm from "../post-jobs/components/PostBoxForm";
import MenuToggler from "../../MenuToggler";
import PostJobSteps from '../post-jobs/components/PostJobSteps';


const index = () => {
  // State to track user role
  const { data: session } = useSession(); // เพิ่ม status
  
  // Determine which sidebar to show based on user role
  const renderSidebar = () => {
    if (session?.user.role === "admin") {
      return <DashboardAdminSidebar />;
    } else if (session?.user.role === "employer" || session?.user.role === "employeroutside") {
      return <DashboardEmployerSidebar />;
    } else {
      // Fallback or default sidebar (optional)
      return <DashboardEmployerSidebar />;
    }
  };

  return (
    <div className="page-wrapper dashboard">
      <span className="header-span"></span>
      {/* <!-- Header Span for height --> */}

      <LoginPopup />
      {/* End Login Popup Modal */}

      <DashboardHeader />
      {/* End Header */}

      <MobileMenu />
      {/* End MobileMenu */}

      {renderSidebar()}
      {/* <!-- End User Sidebar Menu --> */}

      {/* <!-- Dashboard --> */}
      <section className="user-dashboard">
        <div className="dashboard-outer">
          <BreadCrumb title="Post a New Job!" />
          {/* breadCrumb */}

          <MenuToggler />
          {/* Collapsible sidebar button */}

          <div className="row">
            <div className="col-lg-12">
              {/* <!-- Ls widget --> */}
              <div className="ls-widget">
                <div className="tabs-box">
                  <div className="widget-title">
                    <h4>Post Job</h4>
                  </div>

                  <div className="widget-content">
                    <PostJobSteps />
                    {/* End job steps form */}
                    <PostBoxForm />
                    {/* End post box form */}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* End .row */}
        </div>
        {/* End dashboard-outer */}
      </section>
      {/* <!-- End Dashboard --> */}

      <CopyrightFooter />
      {/* <!-- End Copyright --> */}
    </div>
    // End page-wrapper
  );
};

export default index;