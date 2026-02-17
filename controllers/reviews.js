const Review = require("../models/reviews.js");
const Listing = require("../models/listing.js");
const ExpressError = require("../utils/expressError.js");

// CREATE REVIEW
module.exports.createReview = async (req, res) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    throw new ExpressError(404, "Listing not found");
  }

  const review = new Review(req.body.review);
  review.author = req.user._id;

  listing.reviews.push(review);

  await review.save();
  await listing.save();

  req.flash("success", "Review added successfully!");
  res.redirect(`/listings/${listing._id}`);
};

// DELETE REVIEW
module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;

  // Remove review reference from listing
  await Listing.findByIdAndUpdate(id, {
    $pull: { reviews: reviewId }
  });

  // Delete review document
  await Review.findByIdAndDelete(reviewId);

  req.flash("success", "Review deleted!");
  res.redirect(`/listings/${id}`);
};
