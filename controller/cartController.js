const catchAsyncErrors = require("../utils/catchAsyncErrors");
const AppError = require("../utils/AppError");
const Cart = require("../models/Cart");
const { Product } = require("../models/Product");

/**-------------------------------------
 * @desc   add to cart
 * @router /api/cart
 * @method POST
 * @access private (only login)
 -------------------------------------*/
module.exports.AddToCartCtr = catchAsyncErrors(async (req, res, next) => {
  // check product found
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new AppError("product Not Found", 400));
  }
  const total = product.price * req.body.count;
  const cart = await Cart.create({
    user: req.user.id,
    product: req.params.id,
    count: req.body.count,
    total: total,
  });
  res.status(201).json({
    status: "SUCCESS",
    message: "added to cart  successfully",
    length: cart.length,
    data: { cart },
  });
});
/**-------------------------------------
 * @desc   get all cart
 * @router /api/cart
 * @method POST
 * @access private (only login)
 -------------------------------------*/
module.exports.getAllCartCtr = catchAsyncErrors(async (req, res, next) => {
  // check product found

  const carts = await Cart.find({ user: req.user.id }).populate("product");
  if (!carts) {
    return next(new AppError("product Not Found", 400));
  }
  res.status(200).json({
    status: "SUCCESS",
    message: "",
    length: carts.length,
    data: { carts },
  });
});
/**-------------------------------------
 * @desc   delete cart
 * @router /api/cart
 * @method Delete
 * @access private (only login and user)
 -------------------------------------*/
module.exports.deleteCartCtr = catchAsyncErrors(async (req, res, next) => {
  const cart = await Cart.findById(req.params.id);
  if (!cart) {
    return next(new AppError("product Not Found", 400));
  }

  if (req.user.id !== cart.user._id.toString()) {
    return next(new AppError("access denied , only user himself", 400));
  }

  await Cart.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: "SUCCESS",
    message: "cart deleted success",
    // length: carts.length,
    // data: { carts },
  });
});
/**-------------------------------------
 * @desc   update cart
 * @router /api/cart
 * @method Patch
 * @access private (only login and user)
 -------------------------------------*/
module.exports.UpdateCartCtr = catchAsyncErrors(async (req, res, next) => {
  const cart = await Cart.findById(req.params.id);
  if (!cart) {
    return next(new AppError("product Not Found", 400));
  }

  if (req.user.id !== cart.user._id.toString()) {
    return next(new AppError("access denied , only user himself", 400));
  }

  // Update the count
  cart.count = req.body.count;

  // Calculate the total (Assuming you have access to the product price)
  const product = await Product.findById(cart.product);
  cart.total = cart.count * product.price;

  // Save the updated cart
  await cart.save();
  res.status(200).json({
    status: "SUCCESS",
    message: "Cart updated successfully",
    data: { cart },
  });
});
