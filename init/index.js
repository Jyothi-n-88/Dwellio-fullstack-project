const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/appdbs";

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
   const listingsWithOwner = initData.data.map((obj) => ({
    ...obj,
    owner: '698b14e382a9bfd2db9bc24d'
  }));

  await Listing.insertMany(listingsWithOwner);
  console.log("data was initialized");
};

initDB();