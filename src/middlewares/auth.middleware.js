const jwt = require("jsonwebtoken");
const ApplicationLevelError = require("./ApplicationError.middleware");
const userModel = require("../SCHEMAS/user.schema");

const verifyToken = async (req) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new ApplicationLevelError("Unauthorized", 401);
  }

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;

  try {
    const payload = await jwt.verify(token, process.env.SECRET_KEY_JWT);
    req.user = payload;
    return payload;
  } catch (error) {
    throw new ApplicationLevelError("Invalid or expired token", 401);
  }
};

exports.Auth = async (req, res, next) => {
  try {
    await verifyToken(req);
    next();
  } catch (error) {
    next(error);
  }
};

exports.AuthSystemMiddleware = async (req, res, next) => {
  try {
    await verifyToken(req);

    const user = await userModel.findById(req.user.id).select("+systemUser");

    if (!user || !user.systemUser) {
      return res.status(403).json({
        message: "Forbidden access, not a system user!",
        success: false,
      });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
