const express = require("express");
const router = express.Router();
const passport = require("passport");


// Register Routes for the MemeMail API
router.get("/", (req, res) => {

    return res.render("pages/index");
});

// Auth Routes
router.get("/auth/google", passport.authenticate("google", {
    scope: ["profile", "email"]
}));

router.get("/auth/google/callback", passport.authenticate("google", { failureRedirect: "/", successRedirect: "/inbox" }));

module.exports = router;