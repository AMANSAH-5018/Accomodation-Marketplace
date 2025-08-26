const express = require("express");
const router = express.Router();
const app = express();

const User = require("../models/user");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");

// signup route :-
router.get("/signup", (req, res) => {
  res.render("users/signup.ejs");
});

router.post(
  "/signup",
  wrapAsync(async (req, res) => {
    try {
      let { username, email, password } = req.body;
      const newUser = { email, username };
      const registeredUser = await User.register(newUser, password);
      console.log(registeredUser);
      req.flash("success", "Welcome to the Wanderlust");
      res.redirect("/listings");
    } catch (err) {
      req.flash("error", "This username is already registered!");
      res.redirect("/signup");
    }
  })
);

// login route :-
router.get("/login", (req, res) => {
  res.render("users/login.ejs");
});

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  async (req, res) => {
    req.flash("success", "Welcome back to wanderlust.");
    res.redirect("/listings");
  }
); // (passport.authenticate) is a middleware used for authenticate requests

module.exports = router;
