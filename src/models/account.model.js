const model = require("../SCHEMAS/account.schema");
const ApplicationLevelError = require("../MIDDLEWARES/ApplicationError.middleware");

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

  fetchAllUserAccounts = async (userId) => {
    try {
      console.log("UserId: ",userId);
      
      const accounts = await model.find({ user: userId });
      if (!accounts) {
        return {
          message: "No accounts found, create one to retrieve!",
          success: false,
        };
      }
      return {
        message: "Accounts fetched successfully!",
        accounts,
        success: true,
      };
    } catch (e) {
      throw new ApplicationLevelError(e.message, 500);
    }
  };
}

module.exports = AccountModel;
