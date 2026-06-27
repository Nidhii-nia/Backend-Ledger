const express = require("express")
const transactionController = require("../CONTROLLERS/transaction.controller");
const {Auth,AuthSystemMiddleware} = require("../MIDDLEWARES/auth.middleware");

const TransactionController = new transactionController();

const TransactionRouter = express.Router();

//for creating new transaction
//1. /api/transaction/register
TransactionRouter.post("/register-transaction", Auth ,TransactionController.registerTransaction);

//credit initial funds from a system user to normal user account
//2. /api/transaction/initial-funds
TransactionRouter.post("/system/initial-funds",AuthSystemMiddleware,TransactionController.registerInitialFundsTransaction)

module.exports = TransactionRouter;