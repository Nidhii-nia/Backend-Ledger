const express = require("express");
const accountController = require("../CONTROLLERS/account.controller");
const { Auth } = require("../MIDDLEWARES/auth.middleware");

const AccountController = new accountController();

const AccountRouter = express.Router();

/**for creating new account
 ---/api/register */
AccountRouter.post("/register-acount", Auth, AccountController.registerAccount);

/**Get balance
 * ---/api/account/balance/:accountId */
AccountRouter.get(
  "/balance/:accountId",
  Auth,
  AccountController.getAccountBalance,
);

/** GET ALL ACCOUNTS OF LOGGED IN USER
 --- /api/ */
AccountRouter.get("/", Auth, AccountController.getAllAccounts);

module.exports = AccountRouter;
