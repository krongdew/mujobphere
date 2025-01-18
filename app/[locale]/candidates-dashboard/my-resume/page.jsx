"use client";
import MyResume from "@/components/dashboard-pages/candidates-dashboard/my-resume";
import withRoleProtection from "@/components/auth/withRoleProtection";


const index = () => {
  return (
    <>
      <MyResume />
    </>
  );
};

export default withRoleProtection(index, ['student', 'admin']);

