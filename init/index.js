const mongoose = require('mongoose');
const initData = require('./data.js'); // Importing data from data.js
const Listing = require('../models/listing.js'); // Importing the Listing model

const env = require("dotenv");
env.config();
const MONGO_URL = process.env.MONGO_URL+"/Wanderlust";

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

const initDB = async () => {
    try {
        await Listing.deleteMany(); // Clear existing listings
        await Listing.insertMany(initData.data);
        console.log("Database initialized with sample data.");
    } catch (err) {
        console.error("Error initializing database.", err);
    }
};
initDB().then(() => {
    console.log("Database initialization complete.");
    mongoose.connection.close(); // Close the connection after initialization
}).catch(err => {
    console.error("Error during database initialization.", err);
    mongoose.connection.close(); // Ensure connection is closed on error
});
