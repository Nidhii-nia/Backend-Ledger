const UserModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const emailService = require("../services/email.sevice");

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
      await emailService(email, name);
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
        { id: result.user._id, userName: result.user.email },
        process.env.SECRET_KEY_JWT,
        {
          expiresIn: "1d",
        },
      );
      return res.status(200).json({ result, Token: token });
    } catch (e) {
      next(e);
    }
  };
}

module.exports = UserController;
