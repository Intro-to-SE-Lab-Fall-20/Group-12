const express = require("express");
const helmet = require("helmet");
const path = require("path");

require("./mongoose")(process.env.APPLICATION_DATABASE_URL);

const session = require("express-session");

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const User = require("./models/User");
const { Console } = require("console");

// Create the express server
const app = express();

// Trust any proxy in front of express (Load Balancer, etc.)
app.enable("trust proxy");

// Basic security measures
app.use(helmet({
    contentSecurityPolicy: false, // Not in real production tho
}));

// Parse body content (JSON)
app.use(express.json());

// Setup express sessions
app.use(session({
    secret: process.env.APPLICATION_COOKIE_SECRET || "secret",
    resave: true,
    saveUninitialized: true
}));

// Configure Passport
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    callbackURL: process.env.GOOGLE_REDIRECT_URL || ""
}, async (accessToken, refreshToken, profile, cb) => {
    try {
        const user = await User.findOneAndUpdate({ googleId: profile.id }, {
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            email: profile.emails[0].value,
            googleId: profile.id
        }, { upsert: true, new: true });

        return cb(null, user);
    }
    catch (error) {
        return cb(error, null);
    }
}
));

passport.serializeUser((user, cb) => {
    return cb(null, user.id);
});

passport.deserializeUser(async (id, cb) => {
    User.findById(id, (err, user) => {
        cb(err, user);
    });
});

app.use(passport.initialize());
app.use(passport.session());

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
    console.log(error);
    return res.status(error.status || 500).send({
        message: error.message || "An unknown server error occurred"
    });
});


module.exports = app;