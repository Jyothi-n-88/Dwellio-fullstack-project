const express = require("express");
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const { isLoggedIn,isOwner,validateListing} = require("./middleware");
const listingsController = require("../controllers/listings");
const multer = require("multer");
const { storage } = require("../cloudConfig");   // adjust path if needed
const upload = multer({ storage });

router.route("/")
.get(wrapAsync(listingsController.index))
.post(
  isLoggedIn,
  validateListing,
  upload.single("image"), 
  wrapAsync(listingsController.createListing)
);

// NEW
router.get("/new", isLoggedIn, listingsController.renderNewForm);

// SHOW
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

// EDIT
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingsController.renderEditForm)
);

module.exports=router;