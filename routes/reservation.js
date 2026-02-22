const express = require("express");
const router = express.Router();
const Reservation = require("../models/reservation");
const Listing = require("../models/listing");
const { isLoggedIn } = require("./middleware");

router.post("/:id", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const { checkIn, checkOut } = req.body;

  const existingReservations = await Reservation.find({
    listing: id,
    $or: [
      {
        checkIn: { $lt: new Date(checkOut) },
        checkOut: { $gt: new Date(checkIn) }
      }
    ]
  });

  if (existingReservations.length > 0) {
    req.flash("error", "This date is already booked!");
    return res.redirect(`/listings/${id}`);
  }

  const listing = await Listing.findById(id);

  const totalDays =
    (new Date(checkOut) - new Date(checkIn)) /
    (1000 * 60 * 60 * 24);

  const reservation = new Reservation({
    listing: id,
    guest: req.user._id,
    checkIn,
    checkOut,
    totalPrice: totalDays * listing.price
  });

  await reservation.save();

  req.flash("success", "Reservation successful!");
  res.redirect("/profile");
});

module.exports = router;