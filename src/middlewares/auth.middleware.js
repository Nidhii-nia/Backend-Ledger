const jwt = require("jsonwebtoken");
const ApplicationLevelError = require("./ApplicationError.middleware");

const Auth = (req, res, next) => {
  const token = req.headers["authorization"];
  console.log("Auth header: ", req.headers.authorization);
  
  console.log("Token: ",token);
  

  if (!token) {
    throw new ApplicationLevelError("Unauthorized", 401);
  }

  try {
    const payload = jwt.verify(token, process.env.SECRET_KEY_JWT);
    const user = payload;
    console.log("User: ", payload);
  } catch (e) {
    throw new ApplicationLevelError(e.stack, 500);
  }
  next();
};

module.exports = Auth
