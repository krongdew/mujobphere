// utils/ip.js
export const getIP = (request) => {
    const xff = request.headers.get('x-forwarded-for');
    return xff ? xff.split(',')[0] : '127.0.0.1';
  };