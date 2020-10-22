const express = require("express");
const router = express.Router();
const passport = require("passport");
const { RequireAuth, GmailAPIMiddleware } = require("./middleware");
const { FormatBytes } = require("./utils");
const { Readable } = require("stream");

const MailComposer = require("nodemailer/lib/mail-composer");

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
    const attachments = [];

    // Determine if this is an email or an email with more parts for attachments
    //  why google does this I have 0 clue...
    let emailPart = null;
    if (payload.parts) {
        const mailParts = payload.parts.filter(x => x.filename == "");
        const attachmentParts = payload.parts.filter(x => x.filename != "");

        emailPart = mailParts.find(x => x.mimeType == "text/html") || mailParts[0];
        if (emailPart.parts) {
            emailPart = emailPart.parts.find(x => x.mimeType == "text/html") || emailPart.parts[0];
        }

        for (const attachmentPart of attachmentParts) {
            attachments.push({
                id: attachmentPart.body.attachmentId,
                name: attachmentPart.filename,
                size: attachmentPart.body.size,
                displaySize: FormatBytes(attachmentPart.body.size),
                mimeType: attachmentPart.mimeType
            });
        }

        // console.log("-------------------- PART --------------------");
        // console.log(mailParts);
        // console.log("~~~~~~~~~~~~~~~~~~~~~~~~");
        // console.log(emailPart);
        // console.log("-------------------- ---- --------------------");

    } else {
        emailPart = payload;
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
        to: GetHeaderValue("To").split(",").map(x => x.trim()).filter(x => x != ""),
        cc: GetHeaderValue("Cc").split(",").map(x => x.trim()).filter(x => x != ""),
        subject: GetHeaderValue("Subject") || "(No Subject)",
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

// Email Composition
router.get("/compose", RequireAuth, GmailAPIMiddleware, async (req, res) => {
    const messageId = req.query.messageId;
    const type = req.query.type;
    let email = null;
    if (type && messageId) {
        const emailResponse = await req.gmail.users.messages.get({
            userId: "me",
            id: messageId
        });

        email = ParseGmailMessageResponse(emailResponse);
    }

    return res.render("pages/compose", { user: req.user, email, query: null, type });
});

router.post("/compose", RequireAuth, GmailAPIMiddleware, async (req, res) => {
    const to = req.body.to || [];
    const cc = req.body.cc || [];
    const bcc = req.body.bcc || [];
    const subject = req.body.subject;
    const html = req.body.html;
    const files = req.body.attachments || [];

    if (to.length == 0) {
        return res.status(400).json({ message: "To field missing" });
    }

    if (!html) {
        return res.status(400).json({ message: "Email body missing" });
    }

    const RFC822 = new MailComposer({
        to,
        from: req.user.email,
        sender: req.user.email,
        cc,
        bcc,
        subject,
        html,
        attachments: files.map(file => {
            return {
                filename: file.name,
                path: file.data // Nodemailer can pull the mimeType for us here
            }
        })
    });

    const buffer = await RFC822.compile().build();
    const messageResponse = await req.gmail.users.messages.send({
        userId: "me",
        requestBody: {
            raw: buffer.toString("base64")
        }
    });

    return res.status(200).json(messageResponse);
});

// Message/Email Detail Rendering
router.get("/message/:id", RequireAuth, GmailAPIMiddleware, async (req, res) => {
    if (!req.params["id"]) {
        return res.redirect("/inbox");
    }

    // Mark email as read
    await req.gmail.users.messages.modify({
        userId: "me",
        id: req.params["id"],
        requestBody: {
            removeLabelIds: "UNREAD"
        }
    });

    const emailResponse = await req.gmail.users.messages.get({
        userId: "me",
        id: req.params["id"]
    });

    const email = ParseGmailMessageResponse(emailResponse);

    // return res.status(200).json(email);

    return res.render("pages/message", { user: req.user, email, query: null });
});

module.exports = router;