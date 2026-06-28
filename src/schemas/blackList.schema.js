const mongoose = require("mongoose");

const tokenBlackListSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: [true, "Token is required to blacklist"],
      unique: true,
    },
    blacklistedAt: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
  },
  {
    timestamps: true,
  }
);

tokenBlackListSchema.index(
  { blacklistedAt: 1 },
  {
    expireAfterSeconds: 60 * 60 * 24 * 3, // 3 days
  }
);

const TokenBlackListModel = mongoose.model(
  "tokenBlackList",
  tokenBlackListSchema
);

module.exports = TokenBlackListModel;