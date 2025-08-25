// Joi is a powerful schema description language and data validator for JavaScript. It allows you to define the structure and constraints of your data, making it easier to validate user input and ensure data integrity.

const Joi = require("joi");

// LISTING
// for listing validation from serverside
const listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    location: Joi.string().required(),
    country: Joi.string().required(),
    price: Joi.number().required().min(0),
    image: Joi.number().allow("", null),
  }).required(),
});
module.exports = { listingSchema };

// REVIEWS
// for review validation from serverside :-
module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    comment: Joi.string().required(),
  }).required(),
});
