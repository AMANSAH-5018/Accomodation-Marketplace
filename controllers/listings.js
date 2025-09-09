const Listing = require("../models/listing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

// index route
module.exports.index = async (req, res) => {
    try {
        const allListings = await Listing.find({});
        // console.log("Listings fetched successfully:", allListings);
        res.render("listings/index.ejs", { allListings });
    } catch (err) {
        console.error("Error fetching listings:", err);
        res.status(500).send("Error fetching listings.");
    }
}


// render to new form
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
}


// show listings
module.exports.showListing = (async (req, res) => {
    try {
        let { id } = req.params;
        const listing = await Listing.findById(id)
            .populate({ path: "reviews", populate: { path: "author" } })
            .populate("owner");
        if (!listing) {
            req.flash(
                "error",
                "Sorry, this listing has been deleted or no longer available."
            );
            return res.redirect("/listings");
            // return res.status(404).send("This listing is no longer available.");
        }
        console.log(listing);
        res.render("listings/show.ejs", { listing });
    } catch (err) {
        console.error("Error fetching listing:", err);
        res.status(500).send("Error fetching listing.");
    }
})


// create a new listing
module.exports.createListing = async (req, res, next) => {
    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
    }).send()

    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    newListing.geometry = response.body.features[0].geometry;
    let savedListing = await newListing.save();
    console.log(savedListing);
    req.flash("success", "New listing created successfully.");
    res.redirect("/listings");
}


// edit listing
module.exports.renderEditForm = async (req, res) => {
    try {
        let { id } = req.params;
        const listing = await Listing.findById(id);
        if (!listing) {
            req.flash("error", "Listing not found or has been deleted.");
            return res.redirect("/listings");
            // return res.status(404).send("This listing does not found.");
        }
        let originalImageUrl = listing.image.url;
        originalImageUrl = originalImageUrl.replace("/upload", "upload/h_300. w_450");
        res.render("listings/edit.ejs", { listing, originalImageUrl });
    } catch (err) {
        console.error("Error fetching listing for edit:", err);
        res.status(500).send("Error fetching listing for edit.");
    }
}


// update listing
module.exports.updateListing = async (req, res, next) => {
    if (!req.body.listing) {
        req.flash("error", "Invalid data provided to update listing.");
        return res.redirect(`/listings/${id}`); // Redirect to the previous page
    }
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }
    req.flash("success", "Listing updated successfully.");
    res.redirect(`/listings/${id}`);
}


// delete listing
module.exports.destroyListing = async (req, res, next) => {
    if (!req.body.listing) {
        req.flash("error", "Invalid data provided to update listing.");
        return res.redirect(`/listings/${id}`); // Redirect to the previous page
    }
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash("success", "Listing updated successfully.");
    res.redirect(`/listings/${id}`);
}
