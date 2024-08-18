const mongoose = require("mongoose");
const joi = require("joi");
const validator = require("validator");


const CartSchema =  new mongoose.Schema({
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
  count:{
    type: Number,
    required: true,
  },
  total:{
    type: Number,
    required: true,
  }
},{
    timestamps: true,
    toJSON:{virtuals: true},
    toObject:{virtuals: true}
})

const Cart = mongoose.model("Cart" , CartSchema)


module.exports = Cart

