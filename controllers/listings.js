const Listing = require("../models/listing");

// INDEX
module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

// NEW
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

// SHOW
module.exports.showListing = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author"
      }
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  res.render("listings/show.ejs", { listing });
};

// CREATE
module.exports.createListing = async (req, res) => {
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;

  await newListing.save();
  req.flash("success", "New listing created!");
  res.redirect("/listings");
};

// EDIT
module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  res.render("listings/edit.ejs", { listing });
};

// UPDATE
module.exports.updateListing = async (req, res) => {
  const { id } = req.params;

  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  req.flash("success", "Listing updated successfully!");
  res.redirect(`/listings/${id}`);
};

// DELETE
module.exports.deleteListing = async (req, res) => {
  const { id } = req.params;

  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing deleted successfully!");
  res.redirect("/listings");
};
