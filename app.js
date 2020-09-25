const dotenv = require("dotenv");
const express = require("express");
const helmet = require("helmet");

require("./mongoose")(process.env.APPLICATION_DATABASE_URL);

const routes = require("./routes");

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

// CORS Stuff
app.use((req, res, next) => {
    // Set Access Control Headers
    res.header("Access-Control-Allow-Origin", "*");
    next();
});

// Register Routes
app.use("/", routes);

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