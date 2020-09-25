const express = require("express");
const router = express.Router();
const passport = require("passport");

const { RequireAuth } = require("./middleware");

// Register Routes for the MemeMail API
router.get("/", (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect("/inbox");
    }es
    return res.render("pages/index");
});

// Auth Routes
router.get("/auth/google", passport.authenticate("google", {
    scope: ["profile", "email"]
}));

router.get("/auth/google/callback", passport.authenticate("google", { failureRedirect: "/", successRedirect: "/inbox" }));

router.get("/logout", (req, res) => {
    req.logout();
    return res.redirect("/");
})

// Other Routes
router.get("/inbox", RequireAuth, (req, res) => {
    return res.render("pages/inbox", { user: req.user });
});

module.exports = router;