import jwt from "jsonwebtoken";
import config from "../config/database.js";

export const authMiddleware = (req, res, next) => {
  // Extract token from headers, usually the Authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify token using the secret key
    const decoded = jwt.verify(token, config.jwtSecret);

    // Attach user info to the request object
    req.user = decoded;

    // Proceed to the next middleware/controller
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};
