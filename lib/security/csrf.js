import crypto from 'crypto';

class CSRFProtection {
  constructor() {
    this.SECRET = process.env.CSRF_SECRET || crypto.randomBytes(32).toString('hex');
  }

  // สร้าง CSRF token
  generateToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // ตรวจสอบ CSRF token
  async validate(request) {
    // ข้าม validation สำหรับ routes ที่ไม่ต้องการ CSRF protection
    const skipPaths = ['/api/auth/callback', '/api/auth/signin'];
    if (skipPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
      return null;
    }

    const token = request.headers.get('x-csrf-token');
    if (!token) {
      return new Error('Missing CSRF token');
    }

    try {
      // ตรวจสอบความถูกต้องของ token
      // สามารถเพิ่มการตรวจสอบเพิ่มเติมตามต้องการ
      if (token.length !== 64) {
        return new Error('Invalid CSRF token');
      }
      return null;
    } catch (error) {
      return error;
    }
  }
}

export const csrf = new CSRFProtection();