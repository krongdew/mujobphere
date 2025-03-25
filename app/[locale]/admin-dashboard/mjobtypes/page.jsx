<<<<<<< HEAD
=======
// app/admin-dashboard/job-types/page.js
>>>>>>> e42a34e29b2780e1a7046b32717a1fb96c33db0f
"use client";

import JobTypes from "@/components/dashboard-pages/admin-dashboard/job-types";
import withRoleProtection from "@/components/auth/withRoleProtection";

const AdminJobTypesPage = () => {
  return (
    <JobTypes />
  );
};

export default withRoleProtection(AdminJobTypesPage, ['admin']);