// app/admin-dashboard/job-applicants/[jobId]/page.js
"use client";

import Applicants from "@/components/dashboard-pages/admin-dashboard/job-applicants";
import withRoleProtection from "@/components/auth/withRoleProtection";


const AdminJobApplicantsPage = () => {

  
  return (
    <Applicants />
  );
};

export default withRoleProtection(AdminJobApplicantsPage, ['admin']);