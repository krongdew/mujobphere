"use client";


import AllApplicants from "@/components/dashboard-pages/employers-dashboard/all-applicants";
import withRoleProtection from "@/components/auth/withRoleProtection";

const CompanyAllapplicants = () => {
  return ( <AllApplicants />
    
  );
};

export default withRoleProtection(CompanyAllapplicants, ['employer', 'employeroutside', 'admin']);
