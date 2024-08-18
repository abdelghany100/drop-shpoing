const mongoose = require("mongoose");
const joi = require("joi");
const validator = require("validator");


const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
      },
},{timestamps: true})

function validateCreateCategory(obj) {
    const Schema = joi.object({
      name: joi.string().trim().required(),
    });
    return Schema.validate(obj);
  }
  

  // Category Model
const Category = mongoose.model("Category", CategorySchema);

module.exports = {
  Category,
  validateCreateCategory
};