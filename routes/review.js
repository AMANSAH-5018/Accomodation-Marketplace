const express = require("express");
const router = express.Router({ mergeParams: true });

const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { reviewSchema } = require("../schema.js");
const Review = require("../models/review.js");

// Serverside validation method for reviews :-
const validateReview = (req, res, next) => {
  let { error } = reviewSchema.validateAsync(req.body);
  if (error) {
    let errMessage = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMessage.details[0].message);
  } else {
    next();
  }
};

// Setting Reviews Routes :
// Review post route :-
router.post(
  "/",
  validateReview,
  wrapAsync(async (req, res) => {
    // console.log(req.params.id);
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    res.redirect(`/listings/${listing._id}`);
  })
);

// Review Delete Route :-
router.delete(
  "/:reviewId",
  wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { review: reviewId } });
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
  })
);

module.exports = router;
