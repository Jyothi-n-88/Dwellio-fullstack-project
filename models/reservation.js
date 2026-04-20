const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema({
  listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
  guest: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  checkIn: Date,
  checkOut: Date,
  // Ensure this field exists to store the quantity
  roomsBooked: {
    type: Number,
    default: 1
  },
  totalPrice: Number,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Reservation", reservationSchema);