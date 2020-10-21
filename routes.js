const express = require("express");
const router = express.Router();
const passport = require("passport");
const { RequireAuth } = require("./middleware");
const { google } = require("googleapis");
const { OAuth2Client } = require("google-auth-library");

// Register Routes for the MemeMail API
router.get("/", (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect("/inbox");
    }
    return res.render("pages/index");
});

// Auth Routes
router.get("/auth/google", passport.authenticate("google", {
    scope: ["profile", "email", "https://mail.google.com/"]
}));

router.get("/auth/google/callback", passport.authenticate("google", { failureRedirect: "/", successRedirect: "/inbox" }));

router.get("/logout", (req, res) => {
    req.logout();
    return res.redirect("/");
})

// Other Routes
router.get("/inbox", RequireAuth, async (req, res) => {
    const q = req.query.query_text;
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

    const messageResponse = await gmail.users.messages.list({
        userId: "me",
        maxResults: 10,
        labelIds: "INBOX",
        q,
        includeSpamTrash: false
    });

    // Iterate through the messages and pull down more information
    const inbox = [];
    const messages = messageResponse.data.messages || [];
    for (let i = 0; i < messages.length; i++) {
        const emailResponse = await gmail.users.messages.get({
            userId: "me",
            id: messages[i].id
        });

        // As usual, it wouldn't be Google if their API didn't suck
        // Parse through all this shit and wrap it in our own data structure that makes sense
        inbox.push({
            googleId: messages[i].id,
            googleThreadId: messages[i].threadId,
            unread: emailResponse.data.labelIds.includes("UNREAD"),
            labels: emailResponse.data.labelIds,
            date: emailResponse.data.payload.headers.find(x => x.name === "Date"),
            from: emailResponse.data.payload.headers.find(x => x.name === "From"),
            to: emailResponse.data.payload.headers.find(x => x.name === "To"),
            subject: emailResponse.data.payload.headers.find(x => x.name === "Subject"),
            snippet: emailResponse.data.snippet,
            body: emailResponse.data.payload.parts,
            attachments: []
        });
    }

    return res.render("pages/inbox", { user: req.user, inbox, query: q });
});

module.exports = router;