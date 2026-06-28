const UserModel = require("../MODELS/user.model");
const jwt = require("jsonwebtoken");
const {sendRegisterationEmail} = require("../SERVICES/email.service");


class UserController {
  constructor() {
    this.UserModel = new UserModel();
  }

  userRegistration = async (req, res, next) => {
    try {
      const { name, email, password } = req.body;
      const result = await this.UserModel.signUser(name, email, password);
      if (!result.success) {
        return res.status(422).json(result);
      }
      await sendRegisterationEmail(email, name);
      return res.status(200).json(result);
    } catch (e) {
      next(e);
    }
  };

  userLogin = async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const result = await this.UserModel.signInUser(email, password);
      if (!result.success) {
        return res.status(401).json(result);
      }
      const token = await jwt.sign(
        { _id: result.user._id, id: result.user._id, userName: result.user.email },
        process.env.SECRET_KEY_JWT,
        {
          expiresIn: "1d",
        },
      );
      // ensure client receives both _id and id for compatibility
      if (result && result.user) {
        result.user.id = result.user._id;
      }

      return res.status(200).json({ result, Token: token });
    } catch (e) {
      next(e);
    }
  };

userLogout = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authorization token is required.",
      });
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    const result = await this.UserModel.signOut(token);
    console.log("Result", result);
    
if(res.cookie){
  res.cookie("token","");
}
    return res.status(200).json(result);
  } catch (e) {
    next(e);
  }
};
}

module.exports = UserController;
