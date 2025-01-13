import { getSession } from 'next-auth/react';

export function withAuth(handler) {
  return async function (req, res) {
    const session = await getSession({ req });

    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    req.user = session.user;
    return handler(req, res);
  };
}

export function withRole(handler, allowedRoles) {
  return withAuth(async function (req, res) {
    const { role } = req.user;

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    return handler(req, res);
  });
}

// อนาคต - เมื่อใช้ SSO
// export function withAuth(handler) {
//   return async function (req, res) {
//     const ssoToken = await validateSSOToken(req);
//     if (!ssoToken) {
//       return res.status(401).json({ error: 'Unauthorized' });
//     }
//     req.user = ssoToken.user;
//     return handler(req, res);
//   };
// }