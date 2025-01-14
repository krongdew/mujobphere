// lib/auth/userManagement.js
import { validateEmail } from "../security/validation";
import { logSecurityEvent } from "../security/logging";
import { query } from "@/lib/db/queries";
import { determineRole } from "./roles";

const createUserProfile = async (userId, role) => {
  try {
    console.log("Creating profile with:", { userId, role });

    if (!userId) {
      throw new Error("userId is required");
    }

    let profileQuery;
    switch (role) {
      case "student":
        profileQuery =
          "INSERT INTO student_profiles (user_id, created_at) VALUES ($1, CURRENT_TIMESTAMP)";
        break;
      case "employer":
        profileQuery =
          "INSERT INTO employer_profiles (user_id, created_at) VALUES ($1, CURRENT_TIMESTAMP)";
        break;
      case "employeroutside":
        profileQuery =
          "INSERT INTO employer_outside_profiles (user_id, created_at) VALUES ($1, CURRENT_TIMESTAMP)";
        break;
      default:
        console.log("No profile needed for role:", role);
        return;
    }

    if (profileQuery) {
      const result = await query(profileQuery, [userId]);
      console.log("Profile created:", { userId, role });
      return result;
    }
  } catch (error) {
    console.error("Profile creation error:", { error, userId, role });
    throw error;
  }
};

export const handleUserSignIn = async (user, account) => {
  try {
    if (!user?.email || !account?.providerAccountId) {
      throw new Error("Invalid user data");
    }

    const email = validateEmail(user.email);
    const role = determineRole(email);

    console.log("User login attempt:", { email, role });

    // Check existing user
    const existingUserResult = await query(
      "SELECT id, role FROM users WHERE email = $1",
      [email]
    );

    let insertedUserId;

    if (!existingUserResult.rows.length) {
      // Insert new user and get the ID
      console.log("Creating new user:", { email, role });

      // ในฟังก์ชัน handleUserSignIn
      const insertUserResult = await query(
        `INSERT INTO users (
    email, 
    name, 
    google_id, 
    profile_image, 
    role, 
    created_at
  ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP) 
  RETURNING *`, // เปลี่ยนเป็น RETURNING * เพื่อดูข้อมูลทั้งหมด
        [email, user.name, account.providerAccountId, user.image, role]
      );

      console.log("Insert result:", insertUserResult.rows[0]); // เพิ่ม logging

      if (!insertUserResult.rows[0]) {
        throw new Error("Failed to create user");
      }

      const newUser = insertUserResult.rows[0];
      insertedUserId = newUser.id;
      // Create profile after we have the user ID
      try {
        await createUserProfile(insertedUserId, role);
      } catch (profileError) {
        console.error("Profile creation failed:", profileError);
        // Continue despite profile creation error
      }

      // Set user properties
      user.id = insertedUserId;
      user.role = role;

      logSecurityEvent("user_created", { userId: insertedUserId, role });
    } else {
      // Update existing user
      const existingUser = existingUserResult.rows[0];
      console.log("Updating existing user:", existingUser);

      await query(
        `UPDATE users 
         SET name = $1,
             google_id = $2,
             profile_image = $3
         WHERE id = $4`,
        [user.name, account.providerAccountId, user.image, existingUser.id]
      );

      // Set user properties
      user.id = existingUser.id;
      user.role = existingUser.role;

      logSecurityEvent("user_updated", {
        userId: existingUser.id,
        role: existingUser.role,
      });
    }

    return true;
  } catch (error) {
    console.error("User management error:", error);
    logSecurityEvent("user_error", {
      error: error.message,
      email: user?.email,
    });
    return false;
  }
};
