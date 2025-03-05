// lib/auth/roles.js
export const ROLES = {
  STUDENT: 'student',
  EMPLOYER: 'employer',
  EMPLOYER_OUTSIDE: 'employeroutside',
  ADMIN: 'admin',
  WAITING: 'waituser'
};

export const determineRole = (email) => {
  // Admin emails
  const adminEmails = [
    'dr.marketing@dr-ads.com'
  ];

  if (adminEmails.includes(email)) {
    return ROLES.ADMIN;
  }

  // whitelist specific emails
  const whitelistedEmails = [
    'dewwiisunny14@gmail.com',
    'dewwiisunny@gmail.com'
  ];

  if (whitelistedEmails.includes(email)) {
    return ROLES.EMPLOYER_OUTSIDE;
  }

  if (email.endsWith('@student.mahidol.edu') || 
      email.endsWith('@student.mahidol.ac.th')) {
    return ROLES.STUDENT;
  }

  if (email.endsWith('@mahidol.ac.th') || 
      email.endsWith('@mahidol.edu')) {
    return ROLES.EMPLOYER;
  }

  // อีเมลอื่นๆ จะถูกกำหนดเป็น waituser
  return ROLES.WAITING;
};

export const getRedirectUrl = (role) => {
  switch (role) {
    case ROLES.STUDENT:
      return '/candidates-dashboard/my-profile';
    case ROLES.EMPLOYER:
    case ROLES.EMPLOYER_OUTSIDE:
      return '/employers-dashboard/company-profile';
    case ROLES.ADMIN:
      return '/admin-dashboard/dashboard';
    case ROLES.WAITING:
      return '/pending-approval';
    default:
      return '/';
  }
};

// เพิ่มฟังก์ชันเช็คสถานะ
export const isWaitingApproval = (role) => {
  return role === ROLES.WAITING;
};

// เพิ่มฟังก์ชันตรวจสอบว่าเป็น admin หรือไม่
export const isAdmin = (role) => {
  return role === ROLES.ADMIN;
};


// export const ROLES = {
//   STUDENT: 'student',
//   EMPLOYER: 'employer',
//   EMPLOYER_OUTSIDE: 'employeroutside',
//   ADMIN:'admin',
//   WAITING: 'waituser'  // เปลี่ยนจาก none เป็น waituser
// };

// export const determineRole = (email) => {
//   // whitelist specific emails
//   const whitelistedEmails = [
//     'dewwiisunny14@gmail.com',
//     'dewwiisunny@gmail.com'
//   ];

//   if (whitelistedEmails.includes(email)) {
//     return ROLES.EMPLOYER_OUTSIDE;
//   }

//   if (email.endsWith('@student.mahidol.edu') || 
//       email.endsWith('@student.mahidol.ac.th')) {
//     return ROLES.STUDENT;
//   }

//   if (email.endsWith('@mahidol.ac.th') || 
//       email.endsWith('@mahidol.edu')) {
//     return ROLES.EMPLOYER;
//   }

//   // อีเมลอื่นๆ จะถูกกำหนดเป็น waituser
//   return ROLES.WAITING;
// };

// export const getRedirectUrl = (role) => {
//   switch (role) {
//     case ROLES.STUDENT:
//       return '/candidates-dashboard/my-profile';
//     case ROLES.EMPLOYER:
//     case ROLES.EMPLOYER_OUTSIDE:
//       return '/employers-dashboard/company-profile';
//     case ROLES.WAITING:
//       return '/pending-approval';  // หรือหน้าที่ต้องการให้ redirect ไป
//     default:
//       return '/';
//   }
// };

// // เพิ่มฟังก์ชันเช็คสถานะ
// export const isWaitingApproval = (role) => {
//   return role === ROLES.WAITING;
// };