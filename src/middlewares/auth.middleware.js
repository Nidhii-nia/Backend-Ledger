const jwt = require("jsonwebtoken");
const ApplicationLevelError = require("./ApplicationError.middleware");
const userModel = require("../SCHEMAS/user.schema");
const TokenBlackListModel = require("../SCHEMAS/blackList.schema");

const verifyToken = async (req) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new ApplicationLevelError("Unauthorized", 401);
  }

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;

  const isBlackListed = await TokenBlackListModel.findOne({ token: token });
  if (isBlackListed) {
    throw new ApplicationLevelError("Unauthorized access, token invalid!", 401);
  }

  try {
    console.log("Received Token:", token);

    const decoded = jwt.decode(token);
    console.log("Decoded without verify:", decoded);

    const payload = jwt.verify(token, process.env.SECRET_KEY_JWT);
    console.log("Verified Payload:", payload);
    req.user = payload;
    console.log("Payload Auth:", req.user);

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

    const user = await userModel.findById(req.user._id).select("+systemUser");

    if (!user || !user.systemUser) {
      return res.status(403).json({
        message: "Forbidden access, not a system user!",
        success: false,
      });
    }

    req.user = user;
    console.log("Payload AuthSystemMiddleware:", req.user);
    next();
  } catch (error) {
    next(error);
  }
};
