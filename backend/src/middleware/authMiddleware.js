const jwt = require("jsonwebtoken");
const User = require("../models/User");

/*
 * Protect routes - Authenticate user via JWT Bearer token
 */
exports.protect = async (req, res, next) => {
    let token;

    // 1. Check for Bearer token in Authorization header
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }

    // 2. Reject if no token is provided
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Not authorized, no token provided"
        });
    }

    try {
        // 3. Verify cryptographic token signature and expiration
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 4. Fetch user from DB (excluding password)
        req.user = await User.findById(decoded.id).select("-password");

        // 5. SECURITY FIX: Check if user still exists in database
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "The user belonging to this token no longer exists"
            });
        }

        // 6. Proceed to next middleware or controller
        return next();
    } catch (error) {
        console.error("JWT Verification Error:", error.message);
        return res.status(401).json({
            success: false,
            message: "Not authorized, token failed or expired"
        });
    }
};

/*
 * Authorize user roles - Role-Based Access Control (RBAC)
 */
exports.authorize = (...roles) => {
    return (req, res, next) => {
        // Ensure user object exists and user's role is in the permitted array
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role '${req.user?.role || "unknown"}' is not authorized to access this route`
            });
        }
        
        return next();
    };
};