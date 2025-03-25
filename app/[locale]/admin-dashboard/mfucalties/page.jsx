// app/admin-dashboard/faculties/page.js
"use client";

import Faculties from "@/components/dashboard-pages/admin-dashboard/faculties";
import withRoleProtection from "@/components/auth/withRoleProtection";

const AdminFacultiesPage = () => {
  return (
    <Faculties />
  );
};

export default withRoleProtection(AdminFacultiesPage, ['admin']);