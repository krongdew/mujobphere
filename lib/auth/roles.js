export const ROLES = {
    STUDENT: 'student',
    EMPLOYER: 'employer',
    EMPLOYER_OUTSIDE: 'employeroutside'
  };
  
  export const determineRole = (email) => {
    // เพิ่มอีเมลทดสอบ
    if (email === 'krongkwan.bua@mahidol.edu') {
      return ROLES.STUDENT;
    }
    
    if (email.endsWith('@student.mahidol.edu') || email.endsWith('@student.mahidol.ac.th')) {
      return ROLES.STUDENT;
    } 
    if (email.endsWith('@mahidol.ac.th') || email.endsWith('@mahidol.edu')) {
      return ROLES.EMPLOYER;
    }
    return ROLES.EMPLOYER_OUTSIDE;
  };
  
  export const getRedirectUrl = (role) => {
    switch (role) {
      case ROLES.STUDENT:
        return '/candidates-dashboard/my-profile';
      case ROLES.EMPLOYER:
      case ROLES.EMPLOYER_OUTSIDE:
        return '/employers-dashboard/company-profile';
      default:
        return '/';
    }
  };