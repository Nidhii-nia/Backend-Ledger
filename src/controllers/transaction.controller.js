const transactionModel = require("../MODELS/transaction.model");
const {
  sendTransactionEmail,
  sendTransactionFailureEmail,
} = require("../services/email.service");

class TransactionController {
  constructor() {
    this.TransactionModel = new transactionModel();
  }

  registerTransaction = async (req, res, next) => {
    try {
      const { fromAccount, toAccount, amount, idempotencyKey } = req.body;
      let result = await this.TransactionModel.createTransaction(
        fromAccount,
        toAccount,
        amount,
        idempotencyKey,
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      const senderUser = result.fromUserAccount?.user || result.fromUserAccount;
      const receiverAccount = result.toUserAccount;

      if (result.status === "FAILED" && senderUser?.email) {
        await sendTransactionFailureEmail(
          senderUser.email,
          senderUser.name,
          amount,
          receiverAccount?._id,
        );
      }

      if (senderUser?.email) {
        await sendTransactionEmail(
          senderUser.email,
          senderUser.name,
          amount,
          receiverAccount?._id,
        );
      }

      return res.status(200).json(result);
    } catch (e) {
      next(e);
    }
  };

  registerInitialFundsTransaction = async (req, res, next) => {
    const { toAccount, amount, idempotencyKey } = req.body;
    const result = await this.TransactionModel.createInitialFundsTransaction(
      toAccount,
      amount,
      idempotencyKey,
    );

    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.status(201).json(result);
  };
}

module.exports = TransactionController;
