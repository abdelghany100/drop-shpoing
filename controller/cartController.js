const catchAsyncErrors = require("../utils/catchAsyncErrors");
const AppError = require("../utils/AppError");
const Cart = require("../models/Cart");
const { Product } = require("../models/Product");
const { response } = require("express");
const Checkout = require("../models/CheckOut");

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
  };
  let cart = await Cart.find({user: req.user.id , product:req.params.id}).populate("product")
  console.log(cart.length);
  if(cart.length > 0){
    return next(new AppError("cart already added", 400));

  }
  else{
    const total = product.price * req.body.count;
    cart = new Cart({
     user: req.user.id,
     product: req.params.id,
     count: req.body.count,
     total: total,
   });
   await cart.save();
   res.status(201).json({
     status: "SUCCESS",
     message: "added to cart  successfully",
     length: cart.length,
     data: { cart },
   });
  }
 
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
  const totalCarts = carts.reduce((acc, cart) => acc + cart.total, 0);

  console.log(totalCarts)
  res.status(200).json({
    status: "SUCCESS",
    message: "",
    length: carts.length,
    data: { carts },
    totalCarts,
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
  const cart = await Cart.findById(req.params.id).populate("product")
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



/**-------------------------------------
 * @desc    check out cart
 * @router /api/cart/checkout
 * @method Patch
 * @access private (only login and user)
 -------------------------------------*/

// Checkout controller

module.exports.CheckOutCartCtr = catchAsyncErrors(async (req, res, next) => {
  // Get the user ID from request
  const userId = req.user.id;

  // Find the user's cart
  const cart = await Cart.find({ user: userId }).populate("product");

  if (!cart || cart.length === 0) {
    return next(new AppError("Your cart is empty",404 ));
  }

  // Calculate the total for the cart
  let totalAmount = 0;
  const products = cart.map(cartItem => {
    const product = cartItem.product;
    const quantity = cartItem.count;
    const priceAtPurchase = product.price;
    
    totalAmount += cartItem.total;

    // Prepare the product details for checkout
    return {
      product: product._id,
      priceAtPurchase: priceAtPurchase,
      quantity: quantity
    };
  });

  // Create a checkout record and save it to the database
  const checkoutRecord = new Checkout({
    user: userId,
    products: products,
    totalAmount: totalAmount,
  });

  await checkoutRecord.save();

  // Optionally: Clear the user's cart after checkout
  await Cart.deleteMany({ user: userId });

  // Respond with the total and checkout details
  return res.status(200).json({
    message: "Checkout successful",
    total: totalAmount,
    checkoutDetails: checkoutRecord,
  });
});
