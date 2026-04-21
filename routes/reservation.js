const express = require("express");
const router = express.Router({ mergeParams: true });
const Reservation = require("../models/reservation");
const Listing = require("../models/listing");
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn, validateReservation } = require("./middleware"); 

// 1. NEW: API TO CHECK AVAILABILITY
router.get("/:id/check-availability", wrapAsync(async (req, res) => {
    const { id } = req.params;
    const { checkIn, checkOut } = req.query;

    if (!checkIn || !checkOut) {
        return res.json({ error: "Missing dates" });
    }

    const userIn = new Date(checkIn);
    const userOut = new Date(checkOut);
    const listing = await Listing.findById(id);

    if (!listing) return res.json({ error: "Listing not found" });

    // Find any overlapping reservations
    const overlappingReservations = await Reservation.find({
        listing: id,
        $or: [
            { checkIn: { $lt: userOut }, checkOut: { $gt: userIn } }
        ]
    });

    // Calculate available rooms
    const roomsTaken = overlappingReservations.reduce((acc, curr) => acc + curr.roomsBooked, 0);
    const roomsAvailable = listing.totalRooms - roomsTaken;

    res.json({ available: roomsAvailable, total: listing.totalRooms });
}));

// 2. CREATE RESERVATION
// routes/reservation.js

router.post("/:id", 
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
            $or: [{ checkIn: { $lt: userOut }, checkOut: { $gt: userIn } }]
        });

        const roomsTaken = overlappingReservations.reduce((acc, curr) => acc + curr.roomsBooked, 0);
        const roomsAvailable = listing.totalRooms - roomsTaken;

        // Ensure user stays on the same page if booking fails
        if (roomsRequested > roomsAvailable) {
            req.flash("error", `Booking failed: Only ${roomsAvailable} rooms available for these dates.`);
            return res.redirect(`/listings/${id}`); 
        }

        // Standardize night calculation to match frontend
        const diffTime = Math.abs(userOut - userIn);
        let nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (nights <= 0) nights = 1; 

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

// 3. DELETE RESERVATION
router.delete("/:id", isLoggedIn, wrapAsync(async (req, res) => {
    await Reservation.findByIdAndDelete(req.params.id);
    req.flash("success", "Reservation cancelled!");
    res.redirect("/profile");
}));

module.exports = router;