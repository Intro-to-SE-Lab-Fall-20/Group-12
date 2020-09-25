const package = require("./package.json");
const express = require("express");
const router = express.Router();

// Register Routes for the MemeMail API
router.get("/", (req, res) => {
    if (process.env.NODE_ENV === "production") {
        return res.status(200).json({
            name: "MemeMail API",
            version: package.version
        });
    }
    return res.status(200).json({
        name: "[DEVELOPMENT] MemeMail API",
        version: package.version
    });
});

module.exports = router;