"use client";

import ChangePassword from "@/components/dashboard-pages/candidates-dashboard/change-password";
import withRoleProtection from "@/components/auth/withRoleProtection";


const index = () => {
  return (
    <>
      <ChangePassword />
    </>
  );
};

export default withRoleProtection(index, ['student', 'admin']);
