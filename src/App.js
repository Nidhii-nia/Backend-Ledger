const dotenv = require('dotenv')
dotenv.config();
const express = require("express");
const ApplicationLevelError = require("./middlewares/ApplicationError.middleware");
const logger = require("./middlewares/logger.middleware");
const UserRouter = require("./routes/user.route");
const { default: mongoose } = require("mongoose");
const cookieParser = require("cookie-parser");

//Create express instance
const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Routes
app.get('/',(req,res)=>res.send("hey"))

//1. Auth Routes
app.use("/api/auth", UserRouter);

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
