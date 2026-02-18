require("dotenv").config();
const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");
const { cloudinary } = require("../cloudConfig"); 
const MONGO_URL = process.env.MONGO_URL;

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  await Listing.deleteMany({});

  const user = await User.findOne({ username: "jyothi" });

  for (let obj of initData.data) {

    // Upload image URL to Cloudinary
    const result = await cloudinary.uploader.upload(obj.image.url, {
  folder: "Dwellio_DEV"
});

    // Replace image object with Cloudinary response
    obj.image = {
      url: result.secure_url,
      filename: result.public_id,
    };

    const listing = new Listing({
      ...obj,
      owner: user._id   // safer than hardcoding id
    });

    await listing.save();
  }

  console.log("Data initialized with Cloudinary images ✅");
};


initDB();