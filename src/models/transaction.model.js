const model = require("../SCHEMAS/transaction.schema");
const accountModel = require("../SCHEMAS/account.schema");
const userModel = require("../SCHEMAS/user.schema");
const ledgerModel = require("../SCHEMAS/ledger.schema");
const ApplicationLevelError = require("../MIDDLEWARES/ApplicationError.middleware");
const mongoose = require("mongoose");
const { randomUUID } = require("crypto");

class TransactionModel {
  createTransaction = async (
    fromAccount,
    toAccount,
    amount,
    idempotencyKey,
  ) => {
    try {
      const normalizedIdempotencyKey =
        typeof idempotencyKey === "string" && idempotencyKey.trim()
          ? idempotencyKey.trim()
          : undefined;
      const finalIdempotencyKey = normalizedIdempotencyKey || randomUUID();

      //1. VALIDATE REQUEST
      if (!fromAccount || !toAccount || !amount || !finalIdempotencyKey) {
        return {
          message:
            `Required details are missing.\n` +
            `Therefore the request cannot be completed.\n\n` +
            `Please check:\n` +
            `fromAccount: ${fromAccount}\n` +
            `toAccount: ${toAccount}\n` +
            `amount: ${amount}\n` +
            `idempotencyKey: ${idempotencyKey}`,
          success: false,
        };
      }

      const fromUserAccount = await accountModel
        .findById(fromAccount)
        .populate({
          path: "user",
          select: "name email",
        });

      const toUserAccount = await accountModel.findById(toAccount);

      if (!fromUserAccount || !toUserAccount) {
        return {
          message: "Invalid fromAccount or toAccount",
          success: false,
        };
      }

      //2. VALIDATE IDEMPOTENCY KEY
      const isTransactionAlreadyExists = await model.findOne({
        idempotencyKey: finalIdempotencyKey,
      });

      if (isTransactionAlreadyExists) {
        if (isTransactionAlreadyExists.status === "COMPLETED") {
          return {
            message: "Transaction already processed!",
            success: true,
          };
        }

        if (isTransactionAlreadyExists.status === "PENDING") {
          return {
            message: "Transaction is in process, yet to complete",
            success: true,
          };
        }

        if (isTransactionAlreadyExists.status === "FAILED") {
          return {
            message: "Transaction failed, please retry!",
            status: isTransactionAlreadyExists.status,
            fromUserAccount,
            toUserAccount,
            success: false,
          };
        }

        if (isTransactionAlreadyExists.status === "REVERSED") {
          return {
            message: "Transaction was reversed, please retry!",
            success: true,
          };
        }
      }

      //3.CHECK ACCOUNT STATUS
      if (fromUserAccount.status !== "ACTIVE") {
        return {
          message: `fromAccount: ${fromAccount} status is NOT ACTIVE, therefore the transaction cannot be processed!`,
          success: false,
        };
      }

      if (toUserAccount.status !== "ACTIVE") {
        return {
          message: `toAccount: ${toAccount} status is NOT ACTIVE, therefore the transaction cannot be processed!`,
          success: false,
        };
      }

      //5.DERIVE SENDER BALANCE FROM LEDGER
      const balance = await fromUserAccount.getBalance();

      if (balance < amount) {
        return {
          message: `Insufficient Balance. Current balance: ${balance}. Amount to be deducted: ${amount}`,
          success: false,
        };
      }

      // 6. Persist PENDING transaction immediately
      const transaction = new model({
        fromAccount: fromUserAccount._id,
        toAccount: toUserAccount._id,
        amount,
        idempotencyKey: finalIdempotencyKey,
        status: "PENDING",
      });

      await transaction.save();

      await new Promise((resolve) => setTimeout(resolve, 15 * 1000));

      const session = await mongoose.startSession();
      try {
        session.startTransaction();

        const debitLedger = new ledgerModel({
          account: fromUserAccount._id,
          amount,
          transaction: transaction._id,
          type: "DEBIT",
        });

        await debitLedger.save({ session });

        const creditLedger = new ledgerModel({
          account: toUserAccount._id,
          amount,
          transaction: transaction._id,
          type: "CREDIT",
        });

        await creditLedger.save({ session });

        transaction.status = "COMPLETED";
        await transaction.save({ session });

        await session.commitTransaction();
      } catch (error) {
        if (session.inTransaction()) {
          await session.abortTransaction();
        }

        transaction.status = "FAILED";
        await transaction.save();

        throw error;
      } finally {
        session.endSession();
      }

      return {
        success: true,
        message: "Transaction created successfully.",
        transaction,
        fromUserAccount,
        toUserAccount,
      };
    } catch (e) {
      throw new ApplicationLevelError(e.message, 500);
    }
  };

  createInitialFundsTransaction = async (toAccount, amount, idempotencyKey) => {
    const session = await mongoose.startSession();
    try {
      const normalizedIdempotencyKey =
        typeof idempotencyKey === "string" && idempotencyKey.trim()
          ? idempotencyKey.trim()
          : undefined;
      const finalIdempotencyKey = normalizedIdempotencyKey || randomUUID();

      const transactionsWithMissingKeys = await model.find({
        $or: [
          { idempotencyKey: null },
          { idempotencyKey: "" },
          { idempotencyKey: { $exists: false } },
        ],
      });

      for (const transactionDoc of transactionsWithMissingKeys) {
        transactionDoc.idempotencyKey = randomUUID();
        await transactionDoc.save({ session });
      }

      // 1. Validate request
      if (!toAccount || !amount || !finalIdempotencyKey) {
        return {
          message:
            `Required details are missing.\n\n` +
            `Please check:\n` +
            `toAccount: ${toAccount}\n` +
            `amount: ${amount}\n` +
            `idempotencyKey: ${idempotencyKey}`,
          success: false,
        };
      }

      // 2. Find the system user
      const systemUser = await userModel.findOne({ systemUser: true });

      // 3. Find the system user's account
      const fromUserAccount = await accountModel.findOne({
        user: systemUser._id,
        status: "ACTIVE",
      });

      if (!fromUserAccount) {
        return {
          message: "System account not found.",
          success: false,
        };
      }

      // 4. Find recipient account
      const toUserAccount = await accountModel.findById(toAccount);

      if (!toUserAccount) {
        return {
          message: "Recipient account not found.",
          success: false,
        };
      }

      if (toUserAccount.status !== "ACTIVE") {
        return {
          message: "Recipient account is not active.",
          success: false,
        };
      }

      // 5. Check idempotency key
      const existingTransaction = await model.findOne({
        idempotencyKey: finalIdempotencyKey,
      });

      if (existingTransaction) {
        return {
          message: "Transaction already exists.",
          success: false,
        };
      }

      // 6. Create transaction
      session.startTransaction();

      const transaction = new model({
        fromAccount: fromUserAccount._id,
        toAccount: toUserAccount._id,
        amount,
        idempotencyKey: finalIdempotencyKey,
        status: "PENDING",
      });

      await transaction.save({ session });

      const debitLedger = new ledgerModel({
        account: fromUserAccount._id,
        amount,
        transaction: transaction._id,
        type: "DEBIT",
      });

      await debitLedger.save({ session });

      const creditLedger = new ledgerModel({
        account: toUserAccount._id,
        amount,
        transaction: transaction._id,
        type: "CREDIT",
      });

      await creditLedger.save({ session });

      transaction.status = "COMPLETED";

      await transaction.save({ session });

      await session.commitTransaction();
      return {
        success: true,
        message: "Initial fund transaction created successfully.",
        transaction,
        fromUserAccount,
        toUserAccount,
      };
    } catch (e) {
      await session.abortTransaction();
      throw new ApplicationLevelError(e.message, 500);
    } finally {
      session.endSession();
    }
  };
}

module.exports = TransactionModel;
