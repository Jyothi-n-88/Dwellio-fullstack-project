require("dotenv").config();
const mongoose = require("mongoose");
const Listing = require("./models/listing");
const MONGO_URL = process.env.MONGO_URL;
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapToken });

// Connect to DB
mongoose.connect(MONGO_URL)
  .then(() => console.log("DB Connected"))
  .catch(err => console.log(err));

const updateListings = async () => {
  const listings = await Listing.find({ geometry: { $exists: false } });

  console.log(`Found ${listings.length} listings to update`);

  for (let listing of listings) {
    try {
      const geoData = await geocoder
        .forwardGeocode({
          query: listing.location + ", " + listing.country,
          limit: 1
        })
        .send();

      if (geoData.body.features.length > 0) {
        listing.geometry = geoData.body.features[0].geometry;
        await listing.save();
        console.log(`Updated: ${listing.title}`);
      }

    } catch (err) {
      console.log(`Error updating ${listing.title}`);
    }
  }

  console.log("Migration Complete");
  mongoose.connection.close();
};

updateListings();
