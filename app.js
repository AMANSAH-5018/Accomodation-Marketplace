const express = require('express');
const app = express();
const env = require("dotenv");
env.config();
const MONGO_URL = process.env.MONGO_URL+"/Wanderlust";

const mongoose = require('mongoose');
const Listing = require('./models/listing.js'); // Importing the Listing model:
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate'); // Importing ejs-mate for layout support
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { stat } = require('fs');


// Database connection setup :-
// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
main().then(() => {
    console.log("Database connection established.");
}).catch(err => {
    console.error("Failed to connect to the database.", err);
});
async function main() {
    try {
        await mongoose.connect(MONGO_URL)
        console.log("Connected to MongoDB successfully.");
    } catch (err) {
        console.error("Error connecting to MongoDB.", err);
    }
}


// Middleware setup :
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Setting the views directory
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded bodies
app.use(methodOverride('_method')); // Middleware to support PUT and DELETE methods
app.engine('ejs', ejsMate); // Using ejs-mate for layout support
app.use(express.static(path.join(__dirname, '/public'))); // Serving static files from the public directory


// Creating routes :
app.get('/', (req, res) => {   // Home Page route :
    res.send("Hello, AMAN SAH");
});


// Index route for listings:
app.get('/listings', async (req, res) => {
    try {
        const allListings = await Listing.find({});
        console.log("Listings fetched successfully:", allListings);
        res.render("listings/index.ejs", { allListings });
    } catch (err) {
        console.error("Error fetching listings:", err);
        res.status(500).send("Error fetching listings.");
    }
});


// New route for creating a listing:
app.get('/listings/new', (req, res) => {
    res.render("listings/new.ejs");
});


// Show route for individual listing by ID :-
app.get('/listings/:id', async (req, res) => {
    try {
        let { id } = req.params;
        const listing = await Listing.findById(id);
        if (!listing) {
            return res.status(404).send("Listing not found.");
        }
        res.render("listings/show.ejs", { listing });
    } catch (err) {
        console.error("Error fetching listing:", err);
        res.status(500).send("Error fetching listing.");
    }
});


// Create Route :-
// app.post("/listings", async (req, res, next) => {
//     let { title, description, price, image, location, country } = req.body;
//     try {
//         const newListing = new Listing(req.body.listing
//             // {
//             // title,
//             // description,
//             // price,
//             // image,
//             // location,
//             // country
//             // }
//         );
//         await newListing.save();
//         res.redirect("/listings");
//     } catch (err) {
//         // console.error("Error creating new listing:", err);
//         // res.status(500).send("Error creating new listing.");
//         next(err);
//     }
// });
// or using it same above by declaring {wrapAsync}

// Create Route :-
app.post("/listings", wrapAsync(async (req, res, next) => {
    const newListing = new Listing(req.body.Listing);
    await newListing.save();
    res.redirect("/listings");
}));


// Edit route for a listing:
app.get('/listings/:id/edit', async (req, res) => {
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
});


// Update route for a listing:
app.put('/listings/:id', async (req, res) => {
    try {
        let { id } = req.params;
        const updatedListing = await Listing.findByIdAndUpdate(id, req.body.listing, { new: true });
        if (!updatedListing) {
            return res.status(404).send("Listing not found.");
        }
        res.redirect(`/listings/${updatedListing._id}`);
    } catch (err) {
        console.error("Error updating listing:", err);
        res.status(500).send("Error updating listing.");
    }
});


// Delete route for a listing:
app.delete('/listings/:id', async (req, res) => {
    try {
        let { id } = req.params;
        const deletedListing = await Listing.findByIdAndDelete(id);
        console.log(deletedListing);
        if (!deletedListing) {
            return res.status(404).send("Listing not found.");
        }
        res.redirect("/listings");
    } catch (err) {
        console.error("Error deleting listing:", err);
        res.status(500).send("Error deleting listing.");
    }
});


// For unmatching routes :-
app.all("/{*path}", (req, res, next) => {
    next(new ExpressError(404, "Page not found"));
});
// OR
// app.all("/*any", (req, res, next) => {
//     next(new ExpressError(404, "Page error not found"));
// });


// Middlewares ....... for Custom Errors :-
app.use((err, req, res, next) => {
    let { statusCode, message } = err;
    res.status(statusCode).send(message);
    // res.send("Something went wrong!");
});


// Creating connection building and port defining :
const port = 3000;
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

