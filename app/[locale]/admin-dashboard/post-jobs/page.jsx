"use client";

import PostJob from "@/components/dashboard-pages/employers-dashboard/post-jobs";
import withRoleProtection from "@/components/auth/withRoleProtection";

const PostJobPage = () => {
  return (
      <PostJob />

  );
};

export default withRoleProtection(PostJobPage, ['employer', 'employeroutside', 'admin']);
