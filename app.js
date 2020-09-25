const dotenv = require("dotenv");
const express = require("express");
const helmet = require("helmet");
const path = require("path");

require("./mongoose")(process.env.APPLICATION_DATABASE_URL);


// Load env variables from .env file
dotenv.config({
    path: (process.env.NODE_ENV === "production") ? ".env.prod" : ".env.dev"
});

// Create the express server
const app = express();

// Trust any proxy in front of express (Load Balancer, etc.)
app.enable("trust proxy");

// Basic security measures
app.use(helmet());

// Parse body content (JSON)
app.use(express.json());

// Set View Engine
app.set("view engine", "ejs");

// Serve static assets from the assets directory
app.use("/assets", express.static(path.join(__dirname, "views/assets")))

// CORS Stuff
app.use((req, res, next) => {
    // Set Access Control Headers
    res.header("Access-Control-Allow-Origin", "*");
    next();
});

// Register Routes
app.use("/", require("./routes"));

// Catch 404s
app.use((req, res, next) => {
    next({
        message: "The requested resource was not found",
        status: 404
    });
});

// Handle Errors
app.use((error, req, res, next) => {
    return res.status(error.status || 500).send({
        message: error.message || "An unknown server error occurred"
    });
});


module.exports = app;