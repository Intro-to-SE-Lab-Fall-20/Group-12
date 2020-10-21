const express = require("express");
const router = express.Router();
const passport = require("passport");
const { RequireAuth, GmailAPIMiddleware } = require("./middleware");

const dayjs = require("dayjs");
const tz = require("dayjs/plugin/timezone");
const rt = require("dayjs/plugin/relativeTime");

dayjs.extend(tz);
dayjs.extend(rt);

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
});

// Other Routes
router.get("/inbox", RequireAuth, GmailAPIMiddleware, async (req, res) => {
    const q = req.query.query_text;
    const messageResponse = await req.gmail.users.messages.list({
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
        const emailResponse = await req.gmail.users.messages.get({
            userId: "me",
            id: messages[i].id
        });

        const GetHeaderValue = (key) => {
            return emailResponse.data.payload.headers.find(x => x.name.toLowerCase() == key.toLowerCase()).value;
        };

        // As usual, it wouldn't be Google if their API didn't suck
        // Parse through all this shit and wrap it in our own data structure that makes sense
        inbox.push({
            googleId: messages[i].id,
            googleThreadId: messages[i].threadId,
            unread: emailResponse.data.labelIds.includes("UNREAD"),
            labels: emailResponse.data.labelIds,
            date: dayjs(Number(emailResponse.data.internalDate)).format("MMM DD, YYYY @ H:mm A"),
            dateRelative: dayjs().from(dayjs(Number(emailResponse.data.internalDate))),
            from: GetHeaderValue("From"),
            to: GetHeaderValue("To"),
            subject: GetHeaderValue("Subject"),
            snippet: emailResponse.data.snippet,
            body: emailResponse.data.payload.parts,
            attachments: []
        });
    }

    const meta = {
        unread: inbox.filter(x => x.unread).length
    }

    return res.render("pages/inbox", { user: req.user, inbox, meta, query: q });
});

module.exports = router;