"use client";

import AdminApplicantDetails from "@/components/dashboard-pages/admin-dashboard/applicant-details/components";
import withRoleProtection from "@/components/auth/withRoleProtection";



const AdminApplicantDetails = () => {
  return ( <AdminApplicantDetails />);
};

export default withRoleProtection(AdminApplicantDetails, ['admin']);
