const express = require("express");
const router = express.Router();
const app = express();

const User = require("../models/user");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware");
const userController = require("../controllers/users");

// signup Route :-
router
  .route("/signup")
  .get(userController.renderSignupForm)
  .post(wrapAsync(userController.userSignup));

// login Route :-
router
  .route("/login")
  .get(userController.renderuserLoginForm)
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      // (passport.authenticate) is an inbuilt middleware used for authenticate requests
      failureRedirect: "/login",
      failureFlash: true,
    }),
    userController.userLogin
  );

// user LogOut Route :-
router.get("/logout", userController.userLogout);

module.exports = router;