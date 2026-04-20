const Listing = require("../models/listing");
const Review = require("../models/reviews");
const { listingSchema, reviewSchema, reservationSchema } = require("../schema.js");
const ExpressError=require("../utils/expressError.js");
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {

        // If it's a GET request → store original URL
        if (req.method === "GET") {
            req.session.returnTo = req.originalUrl;
        } 
        // If it's POST/DELETE → store referer page
        else {
            req.session.returnTo = req.headers.referer;
        }

        req.flash("error", "You must be logged in to do that!");
        return res.redirect("/login");
    }
    next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.redirectUrl = req.session.returnTo;
        delete req.session.returnTo;   
    }
    next();
};

module.exports.isOwner = async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }

    if (!listing.owner.equals(req.user._id)) {
        req.flash("error", "You don't have permission to do that!");
        return res.redirect(`/listings/${id}`);
    }

    next();
};
module.exports.isReviewAuthor = async (req, res, next) => {
    const { reviewId, id } = req.params;
    const review = await Review.findById(reviewId);

    if (!review.author.equals(req.user._id)) {
        req.flash("error", "You are not the author of this review!");
        return res.redirect(`/listings/${id}`);
    }

    next();
};
module.exports.validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(", ");
    throw new ExpressError(400, msg);
  }
  next();
};
module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(", ");
    throw new ExpressError(400, msg);
  }
  next();
};

module.exports.validateReservation = (req, res, next) => {
    let { error } = reservationSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};