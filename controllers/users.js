const User = require("../models/user");


module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs");
}


module.exports.userSignup = async (req, res) => {
    try {
        let { username, email, password } = req.body;
        const newUser = { email, username };
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);
        req.login(registeredUser, (err) => {  // (req.login) is a passport inbuilt function used for logging  the user
            if (err) {
                return next(err);
            }
            req.flash("success", "Account created on Wanderlust successfully.");
            res.redirect("/listings");
        })
    } catch (err) {
        req.flash("error", "This username is already registered!");
        res.redirect("/signup");
    }
}


module.exports.renderuserLoginForm = (req, res) => {
    res.render("users/login.ejs");
}


module.exports.userLogin = async (req, res) => {
    req.flash("success", "Welcome back to wanderlust.");
    // res.redirect("/listings");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
}


module.exports.userLogout = (req, res) => {
    req.logout((err) => {  // (req.logout) is a passport inbuilt function used to log out the user
        if (err) {
            return next(err);
        }
        req.flash("success", "You logged out successfully.");
        res.redirect("/listings");
    });
}