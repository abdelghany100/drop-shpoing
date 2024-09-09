const mongoose = require("mongoose");
const joi = require("joi");
const validator = require("validator");

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    saller: {
      type: String,
      required: true,
      trim: true,
    },
    weight: {
      type: String,
      required: true,
      trim: true,
    },
    brand: {
      type: String,
      required: true,
      trim: true,
    },
    color: {
      type: String,
      required: true,
      trim: true,
    },
    theShape: {
      type: String,
      trim: true,
    },
    specialFeatures: {
      type: String,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: [
        {
          url: {
            type: String,
            required: true,
            trim: true,
          },
        },
      ],
      default: [],
    },
    shipping: {
      type: String,
      trim: true,
    },
    countSeller: {
      type: Number,
    },
    currentPrice: {
      type: Number,
      // required: true,
    },
    discount: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//  Validate  create product
function validateCreateProduct(obj) {
  const Schema = joi.object({
    name: joi.string().trim().required(),
    description: joi.string().trim().required(),
    saller: joi.string().trim().required(),
    weight: joi.string().trim().required(),
    brand: joi.string().trim().required(),
    color: joi.string().trim().required(),
    category: joi.string().trim().required(),
    theShape: joi.string().trim(),
    shipping: joi.string().trim(),
    specialFeatures: joi.string().trim(),
    price: joi.number().required(),
    discount: joi.number().required(),
    tags: joi.array().items(joi.string().trim()),
    image: joi.array().items(
      joi.object({
        url: joi.string().trim().required(),
      })
    ),
  });
  return Schema.validate(obj);
}

function validateUpdateProduct(obj) {
  const Schema = joi.object({
    name: joi.string().trim(),
    description: joi.string().trim(),
    saller: joi.string().trim(),
    weight: joi.string().trim(),
    brand: joi.string().trim(),
    color: joi.string().trim(),
    category: joi.string().trim(),
    theShape: joi.string().trim(),
    shipping: joi.string().trim(),
    specialFeatures: joi.string().trim(),
    price: joi.number(),
    discount: joi.number(),
    tags: joi.array().items(joi.string().trim()),
    image: joi.array().items(
      joi.object({
        url: joi.string().trim(),
      })
    ),
  });
  return Schema.validate(obj);
}
ProductSchema.pre("save", function (next) {
  if (this.isModified("price") || this.isModified("discount")) {
    this.currentPrice = this.price - this.price * (this.discount / 100);
  }
  next();
});
// User Model
const Product = mongoose.model("Product", ProductSchema);

module.exports = {
  Product,
  validateCreateProduct,
  validateUpdateProduct,
};
