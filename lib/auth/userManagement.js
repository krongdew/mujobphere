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
      case "admin":
        profileQuery =
          "INSERT INTO admin_profiles (user_id, created_at) VALUES ($1, CURRENT_TIMESTAMP)";
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

    // ดึงข้อมูล user ที่มีอยู่แล้ว รวมถึง profile_image
    const existingUserResult = await query(
      "SELECT id, role, profile_image FROM users WHERE email = $1",
      [email]
    );

    let insertedUserId;

    if (!existingUserResult.rows.length) {
      // Insert new user
      console.log("Creating new user:", { email, role });

      const insertUserResult = await query(
        `INSERT INTO users (
          email, 
          name, 
          google_id, 
          profile_image, 
          role, 
          created_at
        ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP) 
        RETURNING *`,
        [
          email, 
          user.name, 
          account.providerAccountId, 
          user.image || null, // ใช้ null ถ้าไม่มีรูป
          role
        ]
      );

      console.log("Insert result:", insertUserResult.rows[0]);

      if (!insertUserResult.rows[0]) {
        throw new Error("Failed to create user");
      }

      const newUser = insertUserResult.rows[0];
      insertedUserId = newUser.id;

      try {
        await createUserProfile(insertedUserId, role);
      } catch (profileError) {
        console.error("Profile creation failed:", profileError);
      }

      // Set user properties including profile_image
      user.id = insertedUserId;
      user.role = role;
      user.profile_image = user.image || null;

      logSecurityEvent("user_created", { userId: insertedUserId, role });
    } else {
      // Update existing user
      const existingUser = existingUserResult.rows[0];
      console.log("Updating existing user:", existingUser);

      // อัพเดทข้อมูล user รวมถึง profile_image
      const updateResult = await query(
        `UPDATE users 
         SET name = $1,
             google_id = $2,
             profile_image = $3
         WHERE id = $4
         RETURNING profile_image`, // เพิ่ม RETURNING เพื่อดึงค่า profile_image ที่อัพเดท
        [user.name, account.providerAccountId, user.image || null, existingUser.id]
      );

      // Set user properties including profile_image
      user.id = existingUser.id;
      user.role = existingUser.role;
      user.profile_image = updateResult.rows[0]?.profile_image || null;

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
// import { validateEmail } from "../security/validation";
// import { logSecurityEvent } from "../security/logging";
// import { query } from "@/lib/db/queries";
// import { determineRole } from "./roles";

// const createUserProfile = async (userId, role) => {
//   try {
//     console.log("Creating profile with:", { userId, role });

//     if (!userId) {
//       throw new Error("userId is required");
//     }

//     let profileQuery;
//     switch (role) {
//       case "student":
//         profileQuery =
//           "INSERT INTO student_profiles (user_id, created_at) VALUES ($1, CURRENT_TIMESTAMP)";
//         break;
//       case "employer":
//         profileQuery =
//           "INSERT INTO employer_profiles (user_id, created_at) VALUES ($1, CURRENT_TIMESTAMP)";
//         break;
//       case "employeroutside":
//         profileQuery =
//           "INSERT INTO employer_outside_profiles (user_id, created_at) VALUES ($1, CURRENT_TIMESTAMP)";
//         break;
//       default:
//         console.log("No profile needed for role:", role);
//         return;
//     }

//     if (profileQuery) {
//       const result = await query(profileQuery, [userId]);
//       console.log("Profile created:", { userId, role });
//       return result;
//     }
//   } catch (error) {
//     console.error("Profile creation error:", { error, userId, role });
//     throw error;
//   }
// };

// export const handleUserSignIn = async (user, account) => {
//   try {
//     if (!user?.email || !account?.providerAccountId) {
//       throw new Error("Invalid user data");
//     }

//     const email = validateEmail(user.email);
//     const role = determineRole(email);

//     console.log("User login attempt:", { email, role });

//     // ดึงข้อมูล user ที่มีอยู่แล้ว รวมถึง profile_image
//     const existingUserResult = await query(
//       "SELECT id, role, profile_image FROM users WHERE email = $1",
//       [email]
//     );

//     let insertedUserId;

//     if (!existingUserResult.rows.length) {
//       // Insert new user
//       console.log("Creating new user:", { email, role });

//       const insertUserResult = await query(
//         `INSERT INTO users (
//           email, 
//           name, 
//           google_id, 
//           profile_image, 
//           role, 
//           created_at
//         ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP) 
//         RETURNING *`,
//         [
//           email, 
//           user.name, 
//           account.providerAccountId, 
//           user.image || null, // ใช้ null ถ้าไม่มีรูป
//           role
//         ]
//       );

//       console.log("Insert result:", insertUserResult.rows[0]);

//       if (!insertUserResult.rows[0]) {
//         throw new Error("Failed to create user");
//       }

//       const newUser = insertUserResult.rows[0];
//       insertedUserId = newUser.id;

//       try {
//         await createUserProfile(insertedUserId, role);
//       } catch (profileError) {
//         console.error("Profile creation failed:", profileError);
//       }

//       // Set user properties including profile_image
//       user.id = insertedUserId;
//       user.role = role;
//       user.profile_image = user.image || null;

//       logSecurityEvent("user_created", { userId: insertedUserId, role });
//     } else {
//       // Update existing user
//       const existingUser = existingUserResult.rows[0];
//       console.log("Updating existing user:", existingUser);

//       // อัพเดทข้อมูล user รวมถึง profile_image
//       const updateResult = await query(
//         `UPDATE users 
//          SET name = $1,
//              google_id = $2,
//              profile_image = $3
//          WHERE id = $4
//          RETURNING profile_image`, // เพิ่ม RETURNING เพื่อดึงค่า profile_image ที่อัพเดท
//         [user.name, account.providerAccountId, user.image || null, existingUser.id]
//       );

//       // Set user properties including profile_image
//       user.id = existingUser.id;
//       user.role = existingUser.role;
//       user.profile_image = updateResult.rows[0]?.profile_image || null;

//       logSecurityEvent("user_updated", {
//         userId: existingUser.id,
//         role: existingUser.role,
//       });
//     }

//     return true;
//   } catch (error) {
//     console.error("User management error:", error);
//     logSecurityEvent("user_error", {
//       error: error.message,
//       email: user?.email,
//     });
//     return false;
//   }
// };