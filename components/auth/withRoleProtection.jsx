"use client";

import { useSession } from "next-auth/react";
import LoginWithSocial from "@/components/common/form/login/LoginWithSocial";

export default function withRoleProtection(WrappedComponent, allowedRoles) {
  return function ProtectedComponent(props) {
    const { data: session, status } = useSession();

    // แสดง loading state
    if (status === "loading") {
      return (
        <div className="loading-state text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Loading...</p>
        </div>
      );
    }

    // ถ้าไม่ได้ login หรือไม่มี session หรือไม่มี user
    if (!session || !session.user) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                Login Required
              </h2>
              <p className="text-gray-600 mt-2">
                Please sign in to access this page
              </p>
            </div>
            <LoginWithSocial />
          </div>
        </div>
      );
    }

    // ตรวจสอบว่ามี role หรือไม่ และมีสิทธิ์เข้าถึงหรือไม่
    const userRole = session.user.role;
    
    if (!userRole || !allowedRoles.includes(userRole)) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto bg-yellow-50 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-yellow-800 text-center">
              Access Restricted
            </h2>
            <p className="text-yellow-700 mt-2 text-center">
              You don't have permission to access this page.
            </p>
          </div>
        </div>
      );
    }

    // ถ้ามีสิทธิ์เข้าถึง แสดง Component ที่ส่งมา
    return <WrappedComponent {...props} />;
  };
}