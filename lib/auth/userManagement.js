import { validateEmail } from '../security/validation';
import { logSecurityEvent } from '../security/logging';
import { encrypt } from '../security/encryption';

export const createUserProfile = async (userId, role) => {
  switch (role) {
    case 'student':
      await query('INSERT INTO student_profiles (user_id) VALUES ($1)', [userId]);
      break;
    case 'employer':
      await query('INSERT INTO employer_profiles (user_id) VALUES ($1)', [userId]);
      break;
    case 'employeroutside':
      await query('INSERT INTO employer_outside_profiles (user_id) VALUES ($1)', [userId]);
      break;
  }
};

export const handleUserSignIn = async (user, account) => {
    try {
      // Validate email
      const validatedEmail = validateEmail(user.email);
      
      // Log sign in attempt
      logSecurityEvent('signin_attempt', { email: validatedEmail });
  
      const role = determineRole(validatedEmail);
      
      // เข้ารหัสข้อมูลสำคัญ
      const encryptedGoogleId = encrypt(account.providerAccountId);
  
      const existingUser = await query(
        'SELECT * FROM users WHERE email = $1',
        [validatedEmail]
      );

    if (existingUser.rows.length === 0) {
      const insertUser = await query(
        `INSERT INTO users (email, name, google_id, profile_image, role) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING id`,
        [user.email, user.name, account.providerAccountId, user.image, role]
      );

      const userId = insertUser.rows[0].id;
      await createUserProfile(userId, role);
      user.id = userId;
    } else {
      user.id = existingUser.rows[0].id;
    }

    user.role = role;
    return true;
  } catch (error) {
    logSecurityEvent('signin_error', { 
      error: error.message,
      email: user.email 
    });
    return false;
  }
};