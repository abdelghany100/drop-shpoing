const mongoose = require("mongoose");
const joi = require("joi");
const validator = require("validator");
const fs = require("fs"); // For deleting files

const DynamicSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true },
    image: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    backGround: {
      type: String,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const Dynamic = mongoose.model("Dynamic", DynamicSchema);

module.exports = Dynamic;
