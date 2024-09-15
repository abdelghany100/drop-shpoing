const mongoose = require("mongoose");
const validator = require("validator"); // Add this line to import validator

const CheckoutSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      priceAtPurchase: {
        type: Number,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
  totalAmount: {
    type: Number,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  emailAddress: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: (value) => validator.isEmail(value),
      message: 'Invalid email format',
    },
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: (value) => validator.isMobilePhone(value),
      message: 'Invalid phone number',
    },
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  state: {
    type: String,
    required: true,
    trim: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  postCode: {
    type: String,
    required: true,
    trim: true,
  },
  note: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'canceled'], // Allowed values for status
    default: 'pending', // Set a default value if needed
    required: true
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

const Checkout = mongoose.model("Checkout", CheckoutSchema);

module.exports = Checkout;
