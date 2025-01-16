"use client";

import ManageJobs from "@/components/dashboard-pages/employers-dashboard/manage-jobs";
import withRoleProtection from "@/components/auth/withRoleProtection";

const EmManageJobs = () => {
  return (
    <>
      <ManageJobs />
    </>
  );
};

export default withRoleProtection(EmManageJobs, ['employer', 'employeroutside', 'admin']);
