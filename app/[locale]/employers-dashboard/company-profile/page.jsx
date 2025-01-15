"use client";

import CompanyProfile from "@/components/dashboard-pages/employers-dashboard/company-profile";
import withRoleProtection from "@/components/auth/withRoleProtection";

const CompanyProfilePage = () => {
  return <CompanyProfile />;
};

export default withRoleProtection(CompanyProfilePage, ['employer', 'employeroutside', 'admin']);