const express = require("express");
const router = express.Router();
const passport = require("passport");
const { RequireAuth, GmailAPIMiddleware } = require("./middleware");
const { ParseGmailMessageResponse } = require("./utils");
const { Readable } = require("stream");

const MailComposer = require("nodemailer/lib/mail-composer");


// This file SHOULD be broken up into more files... but YOLO
router.get("/", (req, res) => {
    res.render("pages/landing");
});

/// //////////////////////////
/// NOTES ENDPOINTS
/// //////////////////////////
router.get("/notes", (req, res) => {
    return res.render("pages/notes");
});


/// //////////////////////////
/// MAIL ENDPOINTS
/// //////////////////////////

// Register Routes for the MemeMail API
router.get("/mail", (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect("/mail/inbox");
    }
    return res.render("pages/index");
});

// Auth Routes
router.get("/mail/auth/google", passport.authenticate("google", {
    scope: ["profile", "email", "https://mail.google.com/"]
}));

router.get("/mail/auth/google/callback", passport.authenticate("google", { failureRedirect: "/mail", successRedirect: "/mail/inbox" }));

router.get("/mail/logout", (req, res) => {
    req.logout();
    return res.redirect("/mail");
});

// Other Routes
router.get("/mail/inbox", RequireAuth, GmailAPIMiddleware, async (req, res) => {
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
router.get("/mail/compose", RequireAuth, GmailAPIMiddleware, async (req, res) => {
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

router.post("/mail/compose", RequireAuth, GmailAPIMiddleware, async (req, res) => {
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
router.get("/mail/message/:id", RequireAuth, GmailAPIMiddleware, async (req, res) => {
    if (!req.params["id"]) {
        return res.redirect("/mail/inbox");
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

    // return res.status(200).json(emailResponse);

    const email = ParseGmailMessageResponse(emailResponse);

    // return res.status(200).json(email);

    return res.render("pages/message", { user: req.user, email, query: null });
});

router.get("/mail/message/:messageId/file/:id", RequireAuth, GmailAPIMiddleware, async (req, res) => {
    if (!req.params["messageId"] || !req.params["id"]) {
        return res.redirect("/mail/inbox");
    }

    const emailResponse = await req.gmail.users.messages.get({
        userId: "me",
        id: req.params["messageId"]
    });

    const email = ParseGmailMessageResponse(emailResponse);

    const attachmentResponse = await req.gmail.users.messages.attachments.get({
        userId: "me",
        messageId: req.params["messageId"],
        id: req.params["id"]
    });

    // Ok, this is due to the IDs being random for each request it seems... wish there was a better way without
    //  a massive amount of extra work
    const attachment = email.attachments.find(x => x.size == attachmentResponse.data.size);

    // Get the Base64 encoded version of the file and convert to binary
    //  then stream it to the user's browser
    const file = Buffer.from(attachmentResponse.data.data, "base64");

    // Set disposition so the browser knows the content / process of downloading the binary data
    res.setHeader("Content-disposition", `attachment; filename=${attachment.name}`);
    res.setHeader("Content-type", attachment.mimeType);

    // Stream the file buffer to the browser for download
    Readable.from(file).pipe(res);
});

module.exports = router;