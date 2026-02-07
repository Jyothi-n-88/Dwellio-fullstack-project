const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const Listing=require("./models/listing.js");
const methodOverride = require("method-override");
const app = express();
const ejsMate=require("ejs-mate");
require("dotenv").config();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.engine('ejs', ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
const MONGO_URL = process.env.MONGO_URL;
const PORT = process.env.PORT || 8080;
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/expressError.js");
const { listingSchema,reviewSchema  } = require("./schema.js");
const Review=require("./models/reviews.js");
async function main() {
  await mongoose.connect(MONGO_URL);
}

main()
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});
// app.get("/testingModel",async(req,res)=>
// {
//   let sampleListing=new Listing({
//     title:"Villa in Mysore",
//     description:"Casa Luxora 2BHK|Premium|Ideal",
//     price:1800,
//     location:"Mysore Circle",
//     country:"India",
//     image:""
//   });
//   await sampleListing.save();
//   console.log(sampleListing);
//   res.send("Successful Test");
// });
const validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(", ");
    throw new ExpressError(400, msg);
  }
  next();
};

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(",");
    throw new ExpressError(400, msg);
  }
  next();
};

app.get("/listings",wrapAsync( async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
}));

//New Route
app.get("/listings/new", wrapAsync(async(req, res) => {
  res.render("listings/new.ejs");
}));

//Show Route
app.get("/listings/:id", wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id).populate("reviews");

  if (!listing) {
    throw new ExpressError(404, "Listing not found");
  }

  res.render("listings/show.ejs", { listing });
}));

//Create Route
app.post(
  "/listings",validateListing,
  wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
  })
);


//Edit Route
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", { listing });
}));

//Update Route
app.put("/listings/:id", validateListing,wrapAsync(async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  res.redirect(`/listings/${id}`);
}));

//Delete Route
app.delete("/listings/:id",wrapAsync( async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  res.redirect("/listings");
}));

app.post(
  "/listings/:id/reviews",
  validateReview,
  wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    const review = new Review(req.body.review);

    listing.reviews.push(review);

    await review.save();
    await listing.save();

    res.redirect(`/listings/${listing._id}`);
  })
);

app.delete(
  "/listings/:id/reviews/:reviewId",
  wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;

    // 1️⃣ Remove review reference from listing
    await Listing.findByIdAndUpdate(id, {
      $pull: { reviews: reviewId }
    });

    // 2️⃣ Delete review document itself
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
  })
);

app.use( (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Something went wrong!";
  res.status(statusCode).render("error.ejs", { message });

});

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
