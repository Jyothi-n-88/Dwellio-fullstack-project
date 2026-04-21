const Joi = require("joi");

module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    location: Joi.string().required(),
    country: Joi.string().required(),
    price: Joi.number().required().min(0),
    totalRooms: Joi.number().required().min(1),
    contact: Joi.string()
    .length(10) // Force exactly 10 digits
    .pattern(/^[0-9]+$/) // Only numbers
    .required(),
    category: Joi.string()
      .valid("Trending", "Rooms", "Iconic Cities", "Mountains", "Castles", "Amazing Pools", "Camping", "Farms", "Arctic", "Domes", "Boats")
      .required(),
    image: Joi.object({
      filename: Joi.string().allow("", null),
      url: Joi.string().allow("", null),
    }).optional(),
  }).required(),
});

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    comment: Joi.string().required(),
  }).required(),
});

module.exports.reservationSchema = Joi.object({
    checkIn: Joi.date().required(),
    checkOut: Joi.date().required().greater(Joi.ref('checkIn')),
    roomsToBook: Joi.number().min(1).required(),
});