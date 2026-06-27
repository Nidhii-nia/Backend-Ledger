const ApplicationLevelError = require("../MIDDLEWARES/ApplicationError.middleware");
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
}

module.exports = UserModel;
