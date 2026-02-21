require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/user");

mongoose.connect(process.env.MONGO_URL);

async function fixUsers() {
  const users = await User.find({ createdAt: { $exists: false } });

  for (let user of users) {
    user.createdAt = user.updatedAt || new Date();
    user.updatedAt = user.updatedAt || new Date();
    await user.save();
  }

  console.log("Old users updated!");
  mongoose.connection.close();
}

fixUsers();