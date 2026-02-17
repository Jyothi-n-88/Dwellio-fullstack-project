const express = require("express");
const router=express.Router({ mergeParams: true });
const wrapAsync=require("../utils/wrapAsync.js");
const { isLoggedIn, isReviewAuthor,validateReview } = require("./middleware");
const reviewsController = require("../controllers/reviews");

router.post(
  "/",
  isLoggedIn,
  validateReview,
  wrapAsync(reviewsController.createReview)
);

// DELETE
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(reviewsController.deleteReview)
);

module.exports = router;
