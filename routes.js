const express = require("express");
const router = express.Router();
const passport = require("passport");
const { RequireAuth, GmailAPIMiddleware } = require("./middleware");
const { FormatBytes } = require("./utils");

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

const ParseGmailMessageResponse = (response) => {
    // Emails usually come with multiple parts (Text and a nicer HTML version... we want to display the nice HTML version)
    const payload = response.data.payload;

    // Determine if this is an email or an email with more parts for attachments
    //  why google does this I have 0 clue...
    let emailPart = null;
    const attachments = [];
    if (payload.parts[0].parts) {
        // We have attachments
        emailPart = payload.parts[0].parts.find(x => x.mimeType == "text/html") || payload.parts[0].parts[0];

        // Process the attachments (starting from the second one)
        for (let i = 1; i < payload.parts.length; i++) {
            const attachment = payload.parts[i];
            attachments.push({
                id: attachment.body.attachmentId,
                name: attachment.filename,
                size: FormatBytes(attachment.body.size)
            });
        }
    } else {
        // No attachments
        emailPart = payload.parts.find(x => x.mimeType == "text/html") || payload.parts[0];
    }

    // So, we need to decode and "re-encode" BASE64 due to the 1 byte padding used. Browsers dont like that.
    const decodedData = Buffer.from(emailPart.body.data, "base64");

    const GetHeaderValue = (key) => {
        const header = response.data.payload.headers.find(x => x.name.toLowerCase() == key.toLowerCase());
        return (header) ? header.value : "";
    };

    // As usual, it wouldn't be Google if their API didn't suck
    // Parse through all this shit and wrap it in our own data structure that makes sense
    return {
        googleId: response.data.id,
        googleThreadId: response.data.threadId,
        unread: response.data.labelIds.includes("UNREAD"),
        labels: response.data.labelIds,
        date: dayjs(Number(response.data.internalDate)).format("MMM DD, YYYY @ H:mm A"),
        dateRelative: dayjs(Number(response.data.internalDate)).fromNow(),
        from: GetHeaderValue("From"),
        to: GetHeaderValue("To").split(", "),
        cc: GetHeaderValue("Cc").split(", "),
        subject: GetHeaderValue("Subject"),
        snippet: response.data.snippet,
        body: decodedData.toString("base64"),
        attachments
    };
};

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

        // As usual, it wouldn't be Google if their API didn't suck
        // Parse through all this shit and wrap it in our own data structure that makes sense
        inbox.push(ParseGmailMessageResponse(emailResponse));
    }

    const meta = {
        unread: inbox.filter(x => x.unread).length
    };

    return res.render("pages/inbox", { user: req.user, inbox, meta, query: q });
});

// Message/Email Detail Rendering
router.get("/message/:id", RequireAuth, GmailAPIMiddleware, async (req, res) => {
    if (!req.params["id"]) {
        return res.redirect("/inbox");
    }

    const emailResponse = await req.gmail.users.messages.get({
        userId: "me",
        id: req.params["id"]
    });

    const email = ParseGmailMessageResponse(emailResponse);

    return res.render("pages/message", { user: req.user, email, json: emailResponse.data, query: null });
});

module.exports = router;