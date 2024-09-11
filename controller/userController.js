const catchAsyncErrors = require("../utils/catchAsyncErrors");
const AppError = require("../utils/AppError");
const { User } = require("../models/User");
/**-------------------------------------
 * @desc   get all users
 * @router /api/user
 * @method GET
 * @access private (only admin)
 -------------------------------------*/
module.exports.getAllUsersCtr = catchAsyncErrors(async (req, res, next) => {
  const { pageNumber, USERS_PER_PAGE } = req.query;
  let users;
  const totalUserCount = await User.countDocuments();

  if (pageNumber) {
    users = await User.find()
      .skip((pageNumber - 1) * USERS_PER_PAGE)
      .limit(USERS_PER_PAGE)
      .select(
        "-password -confirmPassword -passwordResetToken -passwordResetTokenExpire"
      )
      .sort({ createdAt: -1 }); // ترتيب تنازلي بناءً على تاريخ الإنشاء
  } else {
    users = await User.find()
      .sort({ createdAt: -1 })
      .select(
        "-password -confirmPassword -passwordResetToken -passwordResetTokenExpire"
      );
  }

  const totalPages = Math.ceil(totalUserCount / USERS_PER_PAGE);
  
  res.status(200).json({
    status: "SUCCESS",
    message: "Users retrieved successfully",
    length: users.length,
    totalUserCount,
    totalPages,
    data: { users },
  });
});

/**-------------------------------------
 * @desc   get single user
 * @router /api/user/:userId
 * @method GET
 * @access private (only admin)
 -------------------------------------*/

module.exports.getSingleUserCtr = catchAsyncErrors(async (req, res, next) => {
  const { userId } = req.params;
  const user = await User.findById(userId).select(
    "-password -confirmPassword -passwordResetToken -passwordResetTokenExpire"
  );

  if (!user) {
    return res.status(404).json({
      status: "FAIL",
      message: "User not found",
    });
  }

  res.status(200).json({
    status: "SUCCESS",
    message: "User retrieved successfully",
    data: { user },
  });
});
/**-------------------------------------
 * @desc   delete user
 * @router /api/user/:userId
 * @method DELETE
 * @access private (only admin)
 -------------------------------------*/

module.exports.deleteUserCtr = catchAsyncErrors(async (req, res, next) => {
  const { userId } = req.params;

  const user = await User.findByIdAndDelete(userId);

  if (!user) {
    return res.status(404).json({
      status: "FAIL",
      message: "User not found",
    });
  }

  res.status(200).json({
    status: "SUCCESS",
    message: "User deleted successfully",
    data: null, // لا يوجد بيانات بعد الحذف
  });
});
