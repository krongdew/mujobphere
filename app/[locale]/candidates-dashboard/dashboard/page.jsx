"use client";
import DashboadHome from "@/components/dashboard-pages/candidates-dashboard/dashboard";
import withRoleProtection from "@/components/auth/withRoleProtection";


const index = () => {
  return (
    <>
      <DashboadHome />
    </>
  );
};

export default withRoleProtection(index, ['student', 'admin']);
