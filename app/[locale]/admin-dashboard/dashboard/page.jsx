"use client";

import DashboadHome from "@/components/dashboard-pages/employers-dashboard/dashboard";
import withRoleProtection from "@/components/auth/withRoleProtection";



const CompanyDashboard = () => {
  return ( <DashboadHome />);
};

export default withRoleProtection(CompanyDashboard, ['employer', 'employeroutside', 'admin']);
