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

// CANCEL RESERVATION
router.delete("/:reservationId", isLoggedIn, async (req, res) => {
  const { reservationId } = req.params;

  const reservation = await Reservation.findById(reservationId);

  if (!reservation) {
    req.flash("error", "Reservation not found.");
    return res.redirect("/profile");
  }

  if (!reservation.guest.equals(req.user._id)) {
    req.flash("error", "Not authorized.");
    return res.redirect("/profile");
  }

  await Reservation.findByIdAndDelete(reservationId);

  req.flash("success", "Reservation cancelled successfully.");
  res.redirect("/profile");
});
module.exports = router;