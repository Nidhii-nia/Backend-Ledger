const ApplicationLevelError = require("../MIDDLEWARES/ApplicationError.middleware");
const TokenBlackListModel = require("../SCHEMAS/blackList.schema");
const model = require("../SCHEMAS/user.schema");

class UserModel {
  signUser = async (name, email, password) => {
    try {
      const emailExists = await model.findOne({
        email: email,
      });

      if (emailExists) {
        return {
          message: "Email already exists!",
          success: false,
        };
      }

      const newUser = new model({ name, email, password });
      const savedResult = await newUser.save();

      const user = savedResult.toObject();

      delete user.password;

      return {
        message: "User registration successful!",
        user: savedResult,
        success: true,
      };
    } catch (error) {
      console.log("ORIGINAL ERROR:", error);
      console.log("ORIGINAL MESSAGE:", error.message);

      throw new ApplicationLevelError(e.message, 500);
    }
  };

  signInUser = async (email, password) => {
    try {
      const userExists = await model
        .findOne({
          email: email,
        })
        .select("+password");

      if (!userExists) {
        return {
          message: "Email does not exist.",
          success: false,
        };
      }

      const correctPass = await userExists.comparePassword(password);

      if (!correctPass) {
        return {
          message: "Incorrect Password.",
          success: false,
        };
      }
      const res = userExists.toObject();

      delete res.password;

      return {
        message: "Login successful",
        user: res,
        success: true,
      };
    } catch (e) {
      throw new ApplicationLevelError(e.message, 500);
    }
  };

  signOut = async (token) => {
    try {
      if (!token) {
        return {
          message: "Authorization token is required to sign out.",
          success: false,
        };
      }

      const blacklist = new TokenBlackListModel({
        token,
      });

      await blacklist.save();

      return {
        message: "User logged out successfully!",
        success: true,
      };
    } catch (e) {
      if (e.code === 11000) {
        return {
          message: "Token is already blacklisted.",
          success: true,
        };
      }
      throw new ApplicationLevelError(e.message, 500);
    }
  };
}

module.exports = UserModel;
