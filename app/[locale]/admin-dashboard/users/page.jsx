// app/admin-dashboard/users/page.js
"use client";

import Users from "@/components/dashboard-pages/admin-dashboard/users";
import withRoleProtection from "@/components/auth/withRoleProtection";

const AdminUsersPage = () => {
  return (
    <Users />
  );
};

export default withRoleProtection(AdminUsersPage, ['admin']);