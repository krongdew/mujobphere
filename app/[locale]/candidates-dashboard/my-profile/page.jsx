"use client";

import MyProfile from "@/components/dashboard-pages/candidates-dashboard/my-profile";
import withRoleProtection from "@/components/auth/withRoleProtection";

const MyProfilePage = () => {
  return <MyProfile />;
};

export default withRoleProtection(MyProfilePage, ['student', 'admin']);