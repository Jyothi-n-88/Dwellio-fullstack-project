const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("./middleware");
const Listing = require("../models/listing");
const multer = require("multer");
const { cloudinary,storage } = require("../cloudConfig");
const upload = multer({ storage });
const User = require("../models/user");
const Reservation = require("../models/reservation");

router.get("/profile", isLoggedIn, async (req, res) => {

  // Listings created by the user
  const userListings = await Listing.find({
    owner: req.user._id
  });

  // Reservations made by the user
  const reservations = await Reservation.find({
    guest: req.user._id
  }).populate("listing");

  res.render("users/profile", {
    user: req.user,
    userListings,
    reservations
  });
});

router.put(
  "/profile/image",
  isLoggedIn,
  upload.single("profileImage"),
  async (req, res) => {
    const user = await User.findById(req.user._id);

    if (req.file) {
      user.image = {
        url: req.file.path,
        filename: req.file.filename
      };
      await user.save();
    }

    res.redirect("/profile");
  }
);
router.delete("/profile/image", isLoggedIn, async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user.image && user.image.filename) {
    await cloudinary.uploader.destroy(user.image.filename);
  }

  user.image = undefined;
  await user.save();

  res.redirect("/profile");
});
router.post("/wishlist/:id", isLoggedIn, async (req, res) => {
   const { id } = req.params;

   await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { wishlist: id } }  // prevents duplicates
   );

   req.flash("success", "Added to wishlist!");
   res.redirect(req.headers.referer);  // 🔥 go back to same page
});
router.delete("/wishlist/:id", isLoggedIn, async (req, res) => {
   const { id } = req.params;

   await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { wishlist: id } }
   );

   req.flash("success", "Removed from wishlist!");
   res.redirect(req.headers.referer);
});
router.get("/wishlist", isLoggedIn, async (req, res) => {
   const user = await User.findById(req.user._id).populate("wishlist");
   res.render("users/wishlist", { listings: user.wishlist });
});
module.exports = router;