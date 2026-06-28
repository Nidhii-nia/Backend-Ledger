const express = require("express");
const UserController = require("../CONTROLLERS/user.controller");
const {Auth} = require("../MIDDLEWARES/auth.middleware");
const userController = new UserController();

const UserRouter = express.Router();

//1. Register Route: POST /api/auth/register
UserRouter.post("/register", (req, res, next) => {
  userController.userRegistration(req, res, next);
});

//2. Login Route: POST /api/auth/login
UserRouter.post("/login", userController.userLogin)


//3. Logout Route : POST /api/auth/logout
UserRouter.post("/logout", userController.userLogout);

module.exports = UserRouter;
