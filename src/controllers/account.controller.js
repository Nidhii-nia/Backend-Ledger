const AccountModel = require("../MODELS/account.model");

class AccountController {
  constructor() {
    this.AccountModel = new AccountModel();
  }

  registerAccount = async (req, res, next) => {
    try {
      let { id } = req.user;
      const result = await this.AccountModel.createAccount(id);
      return res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  };

  getAllAccounts = async (req, res, next) => {
    try {
      const userId = req.user._id;

      const result = await this.AccountModel.fetchAllUserAccounts(userId);
      if (!result.success) {
        return res.status(404).json(result);
      }
      res.status(200).json(result);
    } catch (e) {
      next(e);
    }
  };

  getAccountBalance = async(req,res,next) =>{
    try{
      
    }catch(e){next(e)}
  }
}

module.exports = AccountController;
