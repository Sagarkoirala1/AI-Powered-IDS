const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
    let token;

    // Check if the token exists in the Authorization header (Bearer token pattern)
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            // Get token from header split ("Bearer <token>")
            token = req.headers.authorization.split(" ")[1];

            // Verify the token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Fetch the user from the database (excluding the password) and attach to req object
            req.user = await User.findById(decoded.id).select("-password");

            return next();
        } catch (error) {
            return res.status(401).json({ success: false, message: "Not authorized, token failed" });
        }
    }

    if (!token) {
        return res.status(401).json({ success: false, message: "Not authorized, no token provided" });
    }
};
exports.authorize = (...roles) => {
    return (req, res, next) => {
        // Ensure the protect middleware ran first and attached the user
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: `User role '${req.user?.role}' is not authorized to access this route` 
            });
        }
        next();
    };
};