const express = require("express");
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const { isLoggedIn,isOwner,validateListing} = require("./middleware");
const listingsController = require("../controllers/listings");

router.route("/")
.get(wrapAsync(listingsController.index))
.post(
  isLoggedIn,
  validateListing,
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