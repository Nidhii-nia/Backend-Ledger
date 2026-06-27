const AccountModel = require("../models/account.model");

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
}

module.exports = AccountController;
