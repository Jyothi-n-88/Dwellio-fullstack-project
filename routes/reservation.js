const express = require("express");
const router = express.Router({ mergeParams: true });
const Reservation = require("../models/reservation");
const Listing = require("../models/listing");
const wrapAsync = require("../utils/wrapAsync");
// Verify this path is correct based on your folder structure
const { isLoggedIn, validateReservation } = require("./middleware"); 

// CREATE RESERVATION
router.post("/", 
    isLoggedIn, 
    validateReservation, 
    wrapAsync(async (req, res) => {
        const { id } = req.params;
        const { checkIn, checkOut, roomsToBook } = req.body;
        const roomsRequested = parseInt(roomsToBook);

        const userIn = new Date(checkIn);
        const userOut = new Date(checkOut);

        const listing = await Listing.findById(id);

        const overlappingReservations = await Reservation.find({
            listing: id,
            $or: [
                { checkIn: { $lt: userOut }, checkOut: { $gt: userIn } }
            ]
        });

        const roomsTaken = overlappingReservations.reduce((acc, curr) => acc + curr.roomsBooked, 0);
        const roomsAvailable = listing.totalRooms - roomsTaken;

        if (roomsRequested > roomsAvailable) {
            req.flash("error", `Only ${roomsAvailable} rooms available for these dates.`);
            return res.redirect(`/listings/${id}`);
        }

        const nights = Math.ceil((userOut - userIn) / (1000 * 60 * 60 * 24));
        const reservation = new Reservation({
            listing: id,
            guest: req.user._id,
            checkIn: userIn,
            checkOut: userOut,
            roomsBooked: roomsRequested,
            totalPrice: nights * listing.price * roomsRequested
        });

        await reservation.save();
        req.flash("success", "Reservation confirmed!");
        res.redirect("/profile");
    })
);

// DELETE RESERVATION
router.delete("/:id", isLoggedIn, wrapAsync(async (req, res) => {
    await Reservation.findByIdAndDelete(req.params.id);
    req.flash("success", "Reservation cancelled!");
    res.redirect("/profile");
}));

module.exports = router;