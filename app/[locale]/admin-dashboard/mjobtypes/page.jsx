"use client";

import JobTypes from "@/components/dashboard-pages/admin-dashboard/job-types";
import withRoleProtection from "@/components/auth/withRoleProtection";

const AdminJobTypesPage = () => {
  return (
    <JobTypes />
  );
};

export default withRoleProtection(AdminJobTypesPage, ['admin']);