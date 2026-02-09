const express = require("express");
const router=express.Router({ mergeParams: true });
const {reviewSchema  } = require("../schema.js");
const wrapAsync=require("../utils/wrapAsync.js");
const ExpressError=require("../utils/expressError.js");
const Review=require("../models/reviews.js");
const Listing=require("../models/listing.js");

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(", ");
    throw new ExpressError(400, msg);
  }
  next();
};

router.post(
  "/",
  validateReview,
  wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }
    const review = new Review(req.body.review);

    listing.reviews.push(review);

    await review.save();
    await listing.save();
    req.flash("success", "Review added successfully!");

    res.redirect(`/listings/${listing._id}`);
  })
);

router.delete(
  "/:reviewId",
  wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;

    // 1️⃣ Remove review reference from listing
    await Listing.findByIdAndUpdate(id, {
      $pull: { reviews: reviewId }
    });

    // 2️⃣ Delete review document itself
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review deleted!");
    res.redirect(`/listings/${id}`);
  })
);
module.exports = router;
