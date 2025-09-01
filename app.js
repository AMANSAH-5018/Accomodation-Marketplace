if (process.env.NODE_ENV != "production") {
  require('dotenv').config();
}

const express = require("express");
const app = express();
// const env = require("dotenv");

const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate"); // importing ejs-mate for layout support
const session = require("express-session"); // session is used to store the session time in website
const MongoStore = require("connect-mongo");
const flash = require("connect-flash"); // flash is used to display the message for user for a recent time only
const passport = require("passport");
const LocalStrategy = require("passport-local");
const { serialize, deserialize } = require("v8");

const ExpressError = require("./utils/ExpressError.js");
const User = require("./models/user.js");
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// Database connection setup :-
// MONGO_URL from .env file :
// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl = process.env.MONGO_ATLAS_URL;
main()
  .then(() => {
    console.log("Database connection established.");
  })
  .catch((err) => {
    console.error("Failed to connect to the database.", err);
  });
async function main() {
  try {
    await mongoose.connect(dbUrl);
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


// Mongo Session store in database :-
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", () => {
  console.log("ERROR in MONGO SESSION STORE", err);
});

// Express Session with cookies setup :-
const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUinitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

// Creating routes :
// Home Page route / root route :
app.get("/", (req, res) => {
  res.send("WELCOME TO THE WANDERLUST");
});



app.use(session(sessionOptions)); // acquire session with sessionOptions

app.use(flash()); // using flash before the routes to display the flash messages

// authentication initialization by packages :-
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

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

// Middlewares for storing locals :-
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// authentication for demo user -
app.get("/demo", async (req, res) => {
  let fakeUser = new User({
    email: "fakeuser@gmail.com",
    username: "fake-user",
  });
  let registeredUser = await User.register(fakeUser, "helloworld");
  res.send(registeredUser);
});

// acquiring routes for listings and reviews :-
app.use("/listings", listingRouter); // taken the common routes from listings and reviews
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

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
