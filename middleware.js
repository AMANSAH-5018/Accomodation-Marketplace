const Listing = require("./models/listing");
const Review = require("./models/review.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const ExpressError = require("./utils/ExpressError.js");

// isLoggedIn middleware :-
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        // (is.Authenticated) is a function in passport used to restore the user session
        req.session.redirectUrl = req.originalUrl; // redirect user to add new listing page after login
        req.flash(
            "error",
            "You must be logged in to create a listings on Wanderlust."
        );
        return res.redirect("/login");
    }
    next();
};

// passport does not allows to restore into the locals, so we need to define alternatively
module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

// middleware for owner authorization :-
module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params;
    const updateListing = await Listing.findById(id);
    if (!updateListing.owner.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not the owner of this listing.");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

// Serverside validation method for listing :-
module.exports.validateListing = (req, res, next) => {
    let { error } = listingSchema.validateAsync(req.body);
    if (error) {
        let errMessage = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMessage.details[0].message);
    } else {
        next();
    }
};

// Serverside validation method for reviews :-
module.exports.validateReview = (req, res, next) => {
    let { error } = reviewSchema.validateAsync(req.body);
    if (error) {
        let errMessage = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMessage.details[0].message);
    } else {
        next();
    }
};

// middleware for owner review Delete :-
module.exports.isreviewAuthor = async (req, res, next) => {
    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);
    if (!review.author.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not the author of this review.");
        return res.redirect(`/listings/${id}`);
    }
    next();
}
