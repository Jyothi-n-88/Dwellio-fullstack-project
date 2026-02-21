const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("./middleware");
const Listing = require("../models/listing");

router.get("/profile", isLoggedIn, async (req, res) => {

  const userListings = await Listing.find({ owner: req.user._id });

  res.render("users/profile", {
    user: req.user,
    userListings
  });
});

module.exports = router;