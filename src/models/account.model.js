const model = require("../schemas/account.schema");
const ApplicationLevelError = require("../middlewares/ApplicationError.middleware");

class AccountModel {
  createAccount = async (userId) => {
    try {
      const newUser = new model({ user: userId });
      const savedUser = await newUser.save();
      return {
        message: "Account created successfully.",
        account: savedUser,
        success: true,
      };
    } catch (e) {
      throw new ApplicationLevelError(e.message, 500);
    }
  };
}

module.exports = AccountModel;
