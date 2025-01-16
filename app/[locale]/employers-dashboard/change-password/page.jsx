"use client";

import ChangePassword from "@/components/dashboard-pages/employers-dashboard/change-password";
import withRoleProtection from "@/components/auth/withRoleProtection";


const EmChangePassword = () => {
  return (
    <>
      <ChangePassword />
    </>
  );
};

export default withRoleProtection(EmChangePassword, ['employer', 'employeroutside', 'admin']);
