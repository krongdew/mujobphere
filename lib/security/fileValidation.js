// lib/security/fileValidation.js
export const validateImageFile = async (file) => {
    try {
      // Debug: ตรวจสอบข้อมูลไฟล์ที่ส่งมา
      console.log('Validating file:', {
        type: file.type,
        size: file.size,
        name: file.name
      });
  
      // ตรวจสอบประเภทไฟล์
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        console.log('Invalid mime type:', file.type);
        return {
          isValid: false,
          error: 'Invalid file type. Only JPEG and PNG files are allowed.'
        };
      }
  
      // ตรวจสอบขนาดไฟล์ (1MB)
      const maxSize = 1024 * 1024;
      if (file.size > maxSize) {
        return {
          isValid: false,
          error: 'File size must be less than 1MB.'
        };
      }
  
      // ถ้าผ่านการตรวจสอบทั้งหมด
      return {
        isValid: true,
        fileType: file.type.split('/')[1]
      };
    } catch (error) {
      console.error('File validation error:', error);
      return {
        isValid: false,
        error: 'Error validating file.'
      };
    }
  };