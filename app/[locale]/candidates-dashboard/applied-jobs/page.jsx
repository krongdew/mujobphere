"use client";
import AppliedJobs from "@/components/dashboard-pages/candidates-dashboard/applied-jobs";
import withRoleProtection from "@/components/auth/withRoleProtection";


const index = () => {
  return <AppliedJobs />;
};

export default withRoleProtection(index, ['student', 'admin']);
