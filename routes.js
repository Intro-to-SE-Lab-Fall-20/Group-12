const express = require("express");
const router = express.Router();

// Register Routes for the MemeMail API
router.get("/", (req, res) => {

    return res.render("pages/index");
});


module.exports = router;