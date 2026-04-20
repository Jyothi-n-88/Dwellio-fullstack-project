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

// UPDATE
module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  const { totalRooms, location, country } = req.body.listing;

  // Check current status before update
  const currentListing = await Listing.findById(id);
  if (!currentListing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  // Safety: Don't allow totalRooms to be less than current bookings
  if (totalRooms < currentListing.bookedRooms) {
    req.flash("error", `Cannot set total rooms to ${totalRooms}. ${currentListing.bookedRooms} rooms are already booked.`);
    return res.redirect(`/listings/${id}/edit`);
  }

  // 1. Re-geocode for new coordinates
  const geoData = await geocoder
    .forwardGeocode({
      query: `${location}, ${country}`,
      limit: 1
    })
    .send();

  // 2. Update Basic Info
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  // 3. Update Geometry if location changed
  if (geoData.body.features.length > 0) {
    listing.geometry = geoData.body.features[0].geometry;
  }

  // 4. Handle Image Upload
  if (req.file) {
    if (listing.image && listing.image.filename) {
      await cloudinary.uploader.destroy(listing.image.filename);
    }
    listing.image = { url: req.file.path, filename: req.file.filename };
  }

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