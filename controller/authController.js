const {
  User,
  validateRegisterUser,
  validateLoginUser,
} = require("../models/User");
const catchAsyncErrors = require("../utils/catchAsyncErrors");
const AppError = require("../utils/AppError");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { date } = require("joi");
const { log } = require("console");
/**-------------------------------------
 * @desc Register New User
 * @router /api/auth/register
 * @method POST
 * @access public
 -------------------------------------*/
module.exports.registerUserCtr = catchAsyncErrors(async (req, res) => {
  const { error } = validateRegisterUser(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  let user = await User.findOne({ email: req.body.email });
  if (user) {
    return res.status(400).json({ message: "user already exists" });
  }

  if (req.body.password != req.body.passwordConfirm) {
    return res
      .status(500)
      .json({ message: "password and passwordConfirm are not the same" });
  }

  user = new User({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  await user.save();
  const token = user.generateAuthToken();

  //@TODO - sending email (verify account)

  res
    .status(201)
    .json({ status: "SUCCESS", message: "you register successfully", token });
});
/**-------------------------------------
 * @desc Login New User
 * @router /api/auth/login
 * @method POST
 * @access public
 -------------------------------------*/
 module.exports.loginUserCtr = catchAsyncErrors(async (req, res, next) => {
  const { error } = validateLoginUser(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  let user = await User.findOne({ email: req.body.email }).select("+password");

  if (!user) {
    return next(new AppError("invalid Email or Password", 404));
  }

  const isPasswordMatch = await bcrypt.compare(req.body.password, user.password);
  if (!isPasswordMatch) {
    return next(new AppError("invalid Email or Password", 404));
  }

  // إزالة حقول password و passwordConfirm قبل إرسال الاستجابة
  user.password = undefined;
  user.passwordConfirm = undefined;

  const token = user.generateAuthToken();

  res.status(201).json({
    status: "SUCCESS",
    message: "you login successfully",
    data: {
      user,
    },
    token,
  });
});

/**-------------------------------------
 * @desc   Forget password
 * @router /api/auth/v1/forget-password
 * @method POST
 * @access public
 -------------------------------------*/

exports.forgetPasswordCtr = catchAsyncErrors(async (req, res, next) => {
  if (!req.body.email) {
    return next(new AppError("Please Provide your email address", 400));
  }
  const email = req.body.email;

  //Get user based on posted email
  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError("Please Provide a valid email address", 400));
  }
  //Generate the random token
  const resetToken = user.generateRandomToken();
  // console.log(resetToken);
  // console.log(user.passwordResetToken);

  await user.save({ validateBeforeSave: false });

  const data = {
    name: user.username,
    email: req.body.email,
    otp: resetToken,
  };
  await sendEmail(req.body.email, "dubbizel family", data);

  res.status(200).json({
    status: "success",
    message: "a otp  was sent to your email address",
  });

  //Send it back as an email
});

/**-------------------------------------
 * @desc   verify otp
 * @router /api/auth/v1/verify-otp
 * @method POST
 * @access public
 -------------------------------------*/

exports.verifyOtpCtr = catchAsyncErrors(async (req, res, next) => {
  let otp = req.body.otp;
  // const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  // Get the user based on the token

  if (!otp) {
    return next(new AppError("no otp !!", 400));
  }

  const user = await User.findOne({ passwordResetToken: otp });
  if (!user) {
    return next(new AppError("invalid otp", 400));
  }

  // If the token has not expired, and there is user => set the new password
  if (user.passwordResetTokenExpire.getTime() < Date.now()) {
    return next(new AppError("reset password otp expired", 400));
  }
  res.status(200).json({ message: "success" });
});
/**-------------------------------------
   * @desc   reset password
   * @router /api/auth/v1/reset-password
   * @method POST
   * @access public
   -------------------------------------*/

exports.resetPasswordCtr = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("user not found", 400));
  }

  if (req.body.password != req.body.passwordConfirm) {
    return next(
      new AppError("password and passwordConfirm are not the same", 500)
    );
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = user.passwordResetTokenExpire = undefined;

  await user.save();

  console.log(user.password);
  res.status(200).json({
    status: "success",
    message: "password has been updated successfully",
  });
});
