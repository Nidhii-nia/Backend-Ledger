const express = require("express");
const UserController = require("../controllers/user.controller");
const Auth = require("../middlewares/auth.middleware");
const userController = new UserController();

const UserRouter = express.Router();

//1. Register Route: POST /api/auth/register
UserRouter.post("/register", (req, res, next) => {
  userController.userRegistration(req, res, next);
});

//2. Login Route: POST /api/auth/login
UserRouter.post("/login", userController.userLogin)

//3.testing
UserRouter.get('/',Auth,(req,res)=>{
  res.send("Passed!")
  console.log("Passed successfully");
  
});

module.exports = UserRouter;
