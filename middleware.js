module.exports.RequireAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/");
}

const { google } = require("googleapis");
const { OAuth2Client } = require("google-auth-library");

module.exports.GmailAPIMiddleware = (req, res, next) => {
    const oauthClient = new google.auth.OAuth2({
        clientID: process.env.GOOGLE_CLIENT_ID || "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        callbackURL: process.env.GOOGLE_REDIRECT_URL || ""
    });

    // Set the User's API Key
    oauthClient.setCredentials({ access_token: req.user.googleAccessToken });

    const gmail = google.gmail({
        version: "v1",
        auth: oauthClient
    });

    req.gmail = gmail;
    next();
};