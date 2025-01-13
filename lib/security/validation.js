import validator from 'validator';
import xss from 'xss';

export const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return xss(validator.escape(input.trim()));
  }
  return input;
};

export const validateEmail = (email) => {
  if (!validator.isEmail(email)) {
    throw new Error('Invalid email format');
  }
  // ตรวจสอบโดเมนที่อนุญาต
  const allowedDomains = [
    'mahidol.edu',
    'student.mahidol.edu',
    'student.mahidol.ac.th',
    'mahidol.ac.th'
  ];
  const domain = email.split('@')[1];
  if (!allowedDomains.includes(domain)) {
    throw new Error('Email domain not allowed');
  }
  return email;
};