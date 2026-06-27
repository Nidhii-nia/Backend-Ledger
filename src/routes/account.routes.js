const express = require("express")
const accountController = require("../controllers/account.controller");
const Auth = require("../middlewares/auth.middleware");

const AccountController = new accountController();

const AccountRouter = express.Router();

//for creating new account
AccountRouter.post("/register", Auth ,AccountController.registerAccount);

module.exports = AccountRouter;