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
      console.log("UserId: ", userId);

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

  fetchAccountBalance = async (accountId, userId) => {
    try {
      const accountExists = await model.findOne({
        _id: accountId,
        user: userId,
      });

      if (!accountExists) {
        return {
          message: "Account not found!",
          success: false,
        };
      }

      const balance = await accountExists.getBalance();
      return {
        message: "Balance fetched successfully!",
        balanceInfo: {
          accountId: accountExists._id,
          balance: balance,
        },
        success:true
      };
    } catch (e) {
      throw new ApplicationLevelError(e.message, 500);
    }
  };

  
}

module.exports = AccountModel;
