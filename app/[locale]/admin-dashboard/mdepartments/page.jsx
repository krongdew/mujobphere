"use client";

import Departments from "@/components/dashboard-pages/admin-dashboard/departments";
import withRoleProtection from "@/components/auth/withRoleProtection";

const AdminDepartmentsPage = () => {
  return (
    <Departments />
  );
};

export default withRoleProtection(AdminDepartmentsPage, ['admin']);