/**
 * Middleware to restrict access based on user roles.
 * @param  {...string} allowedRoles - List of roles allowed to access the route.
 * @returns Express middleware function
 */
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: 'Access denied: insufficient permissions.',
      });
    }
    next();
  };
}

module.exports = authorizeRoles;
