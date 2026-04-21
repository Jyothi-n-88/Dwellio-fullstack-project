const { cloudinary } = require("../cloudConfig");
const Listing = require("../models/listing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

const mapToken = process.env.MAP_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapToken });

// INDEX
module.exports.index = async (req, res) => {
  const { search, user, category } = req.query;
  
  let filter = {};
  let isMyListings = false;

  if (search) {
    filter.location = { $regex: search, $options: "i" };
  }
  if (user) {
    filter.owner = user;
    isMyListings = true;
  }
  if (category) {
    filter.category = category;
  }

  const allListings = await Listing.find(filter);

  const listingsGeoJSON = {
    type: "FeatureCollection",
    features: allListings.map(listing => ({
      type: "Feature",
      geometry: listing.geometry,
      properties: {
        id: listing._id,
        title: listing.title,
        location: listing.location
      }
    }))
  };

  res.render("listings/index", { 
    allListings,
    listingsGeoJSON,
    mapToken, // FIXED: Now passing mapToken to the index page
    search,
    isMyListings,
    category: category || "" 
  });
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
      populate: { path: "author" }
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
  const geoData = await geocoder
    .forwardGeocode({
      query: req.body.listing.location + ", " + req.body.listing.country,
      limit: 1
    })
    .send();

  const newListing = new Listing(req.body.listing);
  
  // Safety check for geocoding
  if (geoData.body.features.length > 0) {
    newListing.geometry = geoData.body.features[0].geometry;
  }

  if (req.file) {
    newListing.image = { url: req.file.path, filename: req.file.filename };
  }

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

module.exports.updateListing = async (req, res) => {
  const { id } = req.params;

  // 1. Fetch the document first
  let listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  // 2. Add Geocoding logic (if location/country changed)
  const geoData = await geocoder
    .forwardGeocode({
      query: `${req.body.listing.location}, ${req.body.listing.country}`,
      limit: 1
    })
    .send();
  if (geoData.body.features.length > 0) {
    listing.geometry = geoData.body.features[0].geometry;
  }

  // 3. Handle Image Upload
  if (req.file) {
    listing.image = { url: req.file.path, filename: req.file.filename };
  }

  // 4. THE FIX: Merge all form data (including contact) into the object
  // This ensures 'contact' is present when .save() is called
  listing.set(req.body.listing);

  // 5. Final Save
  await listing.save();

  req.flash("success", "Listing updated successfully!");
  res.redirect(`/listings/${id}`);
};

// DELETE
module.exports.deleteListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (listing.image && listing.image.filename) {
    await cloudinary.uploader.destroy(listing.image.filename);
  }

  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing deleted successfully!");
  res.redirect("/listings");
};