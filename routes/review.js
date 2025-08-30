const express = require("express");
const router = express.Router({ mergeParams: true });

const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Review = require("../models/review.js");
const { validateReview, isLoggedIn, isreviewAuthor } = require("../middleware.js");
const reviewController = require("../controllers/reviews.js")


// Setting Reviews Routes :
// Review post route :-
router.post(
  "/", isLoggedIn,
  validateReview,
  wrapAsync(reviewController.createReview)
);

// Review Delete Route :-
router.delete(
  "/:reviewId", isLoggedIn, isreviewAuthor,
  wrapAsync(reviewController.destroyReview)
);

module.exports = router;
