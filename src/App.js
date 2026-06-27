const dotenv = require('dotenv')
dotenv.config();
const express = require("express");
const ApplicationLevelError = require("./MIDDLEWARES/ApplicationError.middleware");
const logger = require("./MIDDLEWARES/logger.middleware");
const UserRouter = require("./ROUTES/user.route");
const { default: mongoose } = require("mongoose");
const cookieParser = require("cookie-parser");
const AccountRouter = require('./ROUTES/account.routes');
const TransactionRouter = require('./routes/transaction.routes');

//Create express instance
const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Routes
app.get('/',(req,res)=>res.send("hey"))

//1. Auth Routes
app.use("/api/auth", UserRouter);

//2.Account Routes
app.use("/api/account", AccountRouter);

//3.Transaction routes
app.use("/api/transaction", TransactionRouter);


//Handle Application level errors
app.use((err, req, res, next) => {
  logger.error("Error occurred", {
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    body: req.body,
    params: req.params,
    query: req.query,
  });

  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(422).send(err.message);
  }
  if (err instanceof ApplicationLevelError) {
    return res.status(err.code).send(err.message);
  }
  return res.status(500).send("Something went wrong!");
});

module.exports = app;
