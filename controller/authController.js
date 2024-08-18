const bcrypt = require("bcryptjs");
const {
  User,
  validateRegisterUser,
  validateLoginUser,
} = require("../models/User");
const catchAsyncErrors = require("../utils/catchAsyncErrors");
const AppError = require("../utils/AppError");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto")
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

  res.status(201).json({ message: "you register successfully", token });
});

/**-------------------------------------
 * @desc Login New User
 * @router /api/auth/login
 * @method POST
 * @access public
 -------------------------------------*/

module.exports.loginUserCtr = catchAsyncErrors(async (req, res , next) => {
  const { error } = validateLoginUser(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('invalid Email or Password', 404));
  }

  const isPasswordMatch = await bcrypt.compare(
    req.body.password,
    user.password
  );
  if (!isPasswordMatch) {
    return next(new AppError('invalid Email or Password', 404));
  }

  //@TODO - sending email (verify account if not verified)
  const token = user.generateAuthToken();

  res.status(200).json({
    _id: user._id,
    isAdmin: user.isAdmin,
    profilePhoto: user.profilePhoto,
    token,
  });
});

/**-------------------------------------
 * @desc   Forget password
 * @router /api/auth/forget-password
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
  console.log(resetToken);
  await user.save({ validateBeforeSave: false });
  const message = `Hello, ${user.name}
  we've recieved request from you to reset your account password
  please send POST request to the following URL with your new password and password confirmation
  Reset URL: ${req.protocol}://${req.get(
    "host"
  )}/users/reset-password/${resetToken}
  if you did not request that, please ignore this email
  NOTE this link is only valid for 10 Mins
  Thanks
  SBJ Family 
  `;

  await sendEmail({
    to: user.email,
    text: message,

    subject: "Reset Password <Valid for only 10 Mins>",
  });

  res.status(200).json({
    status: "success",
    message: "a URL reset was sent to your email address",
  });

  //Send it back as an email
});

/**-------------------------------------
 * @desc   reset password
 * @router /api/auth/reset-password
 * @method POST
 * @access public
 -------------------------------------*/

exports.resetPasswordCtr = catchAsyncErrors(async (req, res, next) => {
  let token = req.params.token;
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  // Get the user based on the token
  const user = await User.findOne({ passwordResetToken: hashedToken });
  if (!user) {
    return next(new AppError('invalid reset password token', 400));
  }
  // If the token has not expired, and there is user => set the new password
  if (user.passwordResetTokenExpire.getTime() < Date.now()) {
    return next(new AppError('reset password token expired', 400));
  }
  // Update changedPasswrodAt field of the document for the user
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = user.passwordResetTokenExpire = undefined;

  await user.save();
  console.log(user);
  // Log the user in => send JWT
 token = await user.generateAuthToken()

  res.status(200).json({
    status: 'success',
    message: 'password has been updated successfully',
    token,
  });
});
