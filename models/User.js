const mongoose = require("mongoose");
const joi = require("joi");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// User Schema
const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,

      unique: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    passwordConfirm: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function (val) {
          return this.password === val;
        },
        message: "password and passwordConfirm are not the same",
      },
    },

    isAdmin: {
      type: Boolean,
      default: false,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetTokenExpire: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);


// Generate Auth Token
UserSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    {
      id: this._id,
      isAdmin: this.isAdmin,
    },
    process.env.JWT_SECRET_KEY
  );
};

UserSchema.pre("save", async function (next) {
  // Hash the password if the password field is modified
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

UserSchema.methods.generateRandomToken = function () {
  const token = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  this.passwordResetToken = hashedToken;
  this.passwordResetTokenExpire = Date.now() + 10 * 60 * 1000;
  return token;
};

//  Validate Register User
function validateRegisterUser(obj) {
  const Schema = joi.object({
    username: joi.string().trim().required(),
    email: joi.string().trim().required().email(),
    password: joi.string().trim().required(),
    passwordConfirm: joi.string().required(),
  });
  return Schema.validate(obj);
}

//  Validate Login User
function validateLoginUser(obj) {
  const Schema = joi.object({
    email: joi.string().trim().required().email(),
    password: joi.string().trim().required(),
  });
  return Schema.validate(obj);
}

//  Validate update User
function validateUpdateUser(obj) {
  const Schema = joi.object({
    username: joi.string().trim(),
    password: joi.string().trim(),
  });
  return Schema.validate(obj);
}

// User Model
const User = mongoose.model("User", UserSchema);

module.exports = {
  User,
  validateRegisterUser,
  validateLoginUser,
  validateUpdateUser,
};
