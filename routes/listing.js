const express = require("express");
const router = express.Router();

const Listing = require("../models/listing.js"); // Importing the Listing model:
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");


// Index Route for listings to show all listings :-
router.route("/")
  .get(
    wrapAsync(listingController.index)
  ).post(
    isLoggedIn,
    validateListing,
    wrapAsync(listingController.createListing)
  );


// New route for creating a listing:
router.get("/new", isLoggedIn, listingController.renderNewForm);


// Show route for individual listing by ID :-
router.route("/:id")
  .get(
    wrapAsync(listingController.showListing)
  ).put(
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.updateListing)
  ).delete(
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.destroyListing)
  );


// Edit route for a listing :-
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);

module.exports = router;