const mongoose = require("mongoose");
const joi = require("joi");
const validator = require("validator");


const FavoriteSchema =  new mongoose.Schema({
  user:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  product:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },

},{
    timestamps: true,
    toJSON:{virtuals: true},
    toObject:{virtuals: true}
})

const Favorite = mongoose.model("Favorite" , FavoriteSchema)


module.exports = Favorite

