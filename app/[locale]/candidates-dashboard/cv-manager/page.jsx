"use client";
import CvManager from "@/components/dashboard-pages/candidates-dashboard/cv-manager";
import withRoleProtection from "@/components/auth/withRoleProtection";


const index = () => {
  return (
    <>
      <CvManager />
    </>
  );
};

// export default dynamic(() => Promise.resolve(index), { ssr: false });
export default withRoleProtection(index, ['student', 'admin']);
