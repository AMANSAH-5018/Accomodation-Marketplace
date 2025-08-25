const express = require("express");
const app = express();
const env = require("dotenv");

const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate"); // Importing ejs-mate for layout support
const ExpressError = require("./utils/ExpressError.js");
const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");

// Database connection setup :-
// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
// MONGO_URL from .env file :
env.config();
const MONGO_URL = process.env.MONGO_URL + "/wanderlust";
main()
  .then(() => {
    console.log("Database connection established.");
  })
  .catch((err) => {
    console.error("Failed to connect to the database.", err);
  });
async function main() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to MongoDB successfully.");
  } catch (err) {
    console.error("Error connecting to MongoDB.", err);
  }
}

// Middleware setup :
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded bodies
app.set("views", path.join(__dirname, "views")); // Setting the views directory
app.use(express.json());
app.use(methodOverride("_method")); // Middleware to support PUT and DELETE methods
app.engine("ejs", ejsMate); // Using ejs-mate for layout support
app.use(express.static(path.join(__dirname, "/public"))); // Serving static files from the public directory

// Creating routes :
// Home Page route / root route :
app.get("/", (req, res) => {
  res.send("Hello, AMAN SAH");
});

// Create Route :-
/* app.post("/listings", async (req, res, next) => {
    let { title, description, price, image, location, country } = req.body;
    try {
        const newListing = new Listing(req.body.listing
             {
             title,
             description,
             price,
             image,
             location,
             country
             }
        );
        await newListing.save();
        res.redirect("/listings");
    } catch (err) {
         console.error("Error creating new listing:", err);
         res.status(500).send("Error creating new listing.");
        next(err);
    }
 }); */

// Acquiring routes for listings and reviews :-
app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);

// For unmatching / unavailable / unknown routes :-
app.all("/{*path}", (req, res, next) => {
  next(new ExpressError(404, "Page not found"));
});
// OR
// app.all("/*any", (req, res, next) => {
//     next(new ExpressError(404, "Page error not found"));
// });

// Creating Middlewares ... for Custom Errors :-
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;
  // res.status(statusCode).send(message);
  res.status(statusCode).render("error.ejs", { message });
});

// Creating connection building and port defining :
const port = 8080;
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
