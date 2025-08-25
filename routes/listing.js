const express = require("express");
const router = express.Router();

const Listing = require("../models/listing.js"); // Importing the Listing model:
const wrapAsync = require("../utils/wrapAsync.js");
const { listingSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");

// Serverside validation method for listing :-
const validateListing = (req, res, next) => {
  let { error } = listingSchema.validateAsync(req.body);
  if (error) {
    let errMessage = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMessage.details[0].message);
  } else {
    next();
  }
};

// Index Route for listings to show all listings :-
router.get(
  "/",
  wrapAsync(async (req, res) => {
    try {
      const allListings = await Listing.find({});
      console.log("Listings fetched successfully:", allListings);
      res.render("listings/index.ejs", { allListings });
    } catch (err) {
      console.error("Error fetching listings:", err);
      res.status(500).send("Error fetching listings.");
    }
  })
);

// New route for creating a listing:
router.get("/new", (req, res) => {
  res.render("listings/new.ejs");
});

// Show route for individual listing by ID :-
router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    try {
      let { id } = req.params;
      const listing = await Listing.findById(id).populate("reviews");
      if (!listing) {
        return res.status(404).send("Listing not found.");
      }
      res.render("listings/show.ejs", { listing });
    } catch (err) {
      console.error("Error fetching listing:", err);
      res.status(500).send("Error fetching listing.");
    }
  })
);

// --------------------------------------------------------------------

// Create Route for listing :-
router.post(
  "/",
  validateListing,
  wrapAsync(async (req, res, next) => {
    /* if (!req.body.listing) {
      throw new ExpressError(400, "Please send valid data for your listing.");
    } */
    let result = listingSchema.validateAsync(req.body);
    console.log(result);
    if (result.error) {
      throw new ExpressError(400, result.error.details[0].message);
    }
    const newListing = new Listing(req.body.listing);
    /*if (
      !newListing.description ||
      !newListing.title ||
      !newListing.price ||
      !newListing.location ||
      !newListing.country
    ) {
      throw new ExpressError(400, "All fields are required.");
    }*/
    await newListing.save();
    res.redirect("/listings");
  })
);

// Edit route for a listing :
router.get(
  "/:id/edit",
  wrapAsync(async (req, res) => {
    try {
      let { id } = req.params;
      const listing = await Listing.findById(id);
      if (!listing) {
        return res.status(404).send("Listing not found.");
      }
      res.render("listings/edit.ejs", { listing });
    } catch (err) {
      console.error("Error fetching listing for edit:", err);
      res.status(500).send("Error fetching listing for edit.");
    }
  })
);

// Update Route for a listing:
router.put(
  "/:id",
  wrapAsync(async (req, res) => {
    if (!req.body.listing) {
      throw new ExpressError(
        500,
        "Please send the valid data to update listing."
      );
    }
    let { id } = req.params;
    const updatedListing = await Listing.findByIdAndUpdate(
      id,
      req.body.listing,
      { new: true }
    );
    if (!updatedListing) {
      return res.status(404).send("Listing not found.");
    }
    res.redirect(`/listings/${updatedListing._id}`);
  })
);

// Delete route for a listing:
router.delete(
  "/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    if (!deletedListing) {
      return res.status(404).send("Listing not found.");
    }
    res.redirect("/listings");
  })
);

module.exports = router;
