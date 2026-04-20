const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("./middleware"); // Fixed path if needed
const listingsController = require("../controllers/listings");
const multer = require("multer");
const { storage } = require("../cloudConfig");
const upload = multer({ storage });
const Listing = require("../models/listing");

// Suggestions (Search)
router.get("/suggestions", wrapAsync(async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json([]);
  const suggestions = await Listing.find({
    location: { $regex: q, $options: "i" }
  }).distinct("location");
  res.json(suggestions.slice(0, 5));
}));

// Index & Create
router.route("/")
  .get(wrapAsync(listingsController.index))
  .post(
    isLoggedIn,
    upload.single("image"), // Multer first to parse req.body
    validateListing,       // Then validate the parsed body
    wrapAsync(listingsController.createListing)
  );

// New Form
router.get("/new", isLoggedIn, listingsController.renderNewForm);

// Show, Update, Delete
router.route("/:id")
  .get(wrapAsync(listingsController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("image"), 
    validateListing,
    wrapAsync(listingsController.updateListing)
  )
  .delete(
    isLoggedIn,
    isOwner,
    wrapAsync(listingsController.deleteListing)
  );

// Edit Form
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingsController.renderEditForm)
);

module.exports = router;