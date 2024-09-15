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
  }
  let cart = await Cart.find({
    user: req.user.id,
    product: req.params.id,
  }).populate("product");
  console.log(cart.length);
  if (cart.length > 0) {
    return next(new AppError("cart already added", 400));
  } else {
    const total = product.currentPrice * req.body.count;
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

  console.log(totalCarts);
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
  const cart = await Cart.findById(req.params.id).populate("product");
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
  cart.total = cart.count * product.currentPrice;

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
  // console.log(cart)
  const userId = req.user.id;

  // Find the user's cart
  const cart = await Cart.find({ user: userId }).populate("product");

  if (!cart || cart.length === 0) {
    return next(new AppError("Your cart is empty", 404));
  }

  // Calculate the total for the cart
  let totalAmount = 0;
  const products = cart.map((cartItem) => {
    const product = cartItem.product;
    const quantity = cartItem.count;
    const priceAtPurchase = product.currentPrice;

    totalAmount += cartItem.total;

    // Prepare the product details for checkout
    return {
      product: product._id,
      priceAtPurchase: priceAtPurchase,
      quantity: quantity,
    };
  });

  // Extract additional fields from the request body
  const {
    firstName,
    lastName,
    emailAddress,
    phone,
    address,
    state,
    city,
    postCode,
    note,
  } = req.body;

  // Validate the required fields
  if (
    !firstName ||
    !lastName ||
    !emailAddress ||
    !phone ||
    !address ||
    !state ||
    !city ||
    !postCode
  ) {
    return next(
      new AppError("All personal and address fields are required", 400)
    );
  }

  // Create a checkout record and save it to the database
  const checkoutRecord = new Checkout({
    user: userId,
    products: products,
    totalAmount: totalAmount,
    firstName: firstName,
    lastName: lastName,
    emailAddress: emailAddress,
    phone: phone,
    address: address,
    state: state,
    city: city,
    postCode: postCode,
    note: note || "", // Optional field
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

module.exports.completeCheckOutCtr = catchAsyncErrors(
  async (req, res, next) => {
    // Extract checkout ID from the request params
    const { checkoutId } = req.params;
    console.log("Checkout", checkoutId);

    // Find the checkout by ID
    // const checkout = await Checkout.findById(checkoutId);

    const checkout = await Checkout.findByIdAndUpdate(
      checkoutId,
      { status: "completed" }, // Only update the status field
      { new: true, runValidators: false } // Return the updated document
    );
    // Check if the checkout exists
    if (!checkout) {
      return next(new AppError("Checkout not found", 404));
    }

    // // Check if the checkout is already completed
    // if (checkout.status === 'completed') {
    //   return next(new AppError("Checkout is already completed", 400));
    // }

    // Respond with the updated checkout
    res.status(200).json({
      message: "Checkout marked as completed successfully",
      checkout: checkout,
    });
  }
);
// module.exports.CheckOutCartCtr = catchAsyncErrors(async (req, res, next) => {
//   // Get the user ID from request
//   const userId = req.user.id;

//   // Find the user's cart
//   const cart = await Cart.find({ user: userId }).populate("product");

//   if (!cart || cart.length === 0) {
//     return next(new AppError("Your cart is empty", 404));
//   }

//   // Calculate the total for the cart
//   let totalAmount = 0;
//   const products = cart.map((cartItem) => {
//     const product = cartItem.product;
//     const quantity = cartItem.count;
//     const priceAtPurchase = product.currentPrice;

//     totalAmount += cartItem.total;

//     // Prepare the product details for checkout
//     return {
//       product: product._id,
//       priceAtPurchase: priceAtPurchase,
//       quantity: quantity,
//     };
//   });

//   // Extract additional fields from the request body
//   const {
//     firstName,
//     lastName,
//     emailAddress,
//     phone,
//     address,
//     state,
//     city,
//     postCode,
//     note
//   } = req.body;

//   // Validate the required fields
//   if (!firstName || !lastName || !emailAddress || !phone || !address || !state || !city || !postCode) {
//     return next(new AppError("All personal and address fields are required", 400));
//   }

//   // Create a checkout record and save it to the database
//   const checkoutRecord = new Checkout({
//     user: userId,
//     products: products,
//     totalAmount: totalAmount,
//     firstName: firstName,
//     lastName: lastName,
//     emailAddress: emailAddress,
//     phone: phone,
//     address: address,
//     state: state,
//     city: city,
//     postCode: postCode,
//     note: note || "",  // Optional field
//   });

//   await checkoutRecord.save();

//   // Optionally: Clear the user's cart after checkout
//   await Cart.deleteMany({ user: userId });

//   // Respond with the total and checkout details
//   return res.status(200).json({
//     message: "Checkout successful",
//     total: totalAmount,
//     checkoutDetails: checkoutRecord,
//   });
// });
module.exports.getAllCheckoutsCtr = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user.id;
  const { pageNumber = 1, CHECKOUTS_PER_PAGE = 10 } = req.query; // Default values for pagination
  const page = parseInt(pageNumber, 10);
  const limit = parseInt(CHECKOUTS_PER_PAGE, 10);
  const skip = (page - 1) * limit;

  let checkouts,totalCheckoutsCount;

  if (req.user.isAdmin) {
    console.log("Check")
    // If the user is an admin, return all checkout records with pagination
    totalCheckoutsCount = await Checkout.countDocuments();
    checkouts = await Checkout.find({ status: "pending" })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "user",
        select: "-password", // Exclude password field
      })
      .populate({
        path: "products.product", // Populate product details
        select: "-__v", // Exclude unnecessary fields like `__v`
      });
  } else {
    // If the user is not an admin, return only their checkout records with pagination
    totalCheckoutsCount = await Checkout.countDocuments({ user: userId });
    checkouts = await Checkout.find({ user: userId })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "user",
        select: "-password", // Populate user details excluding the password field
      })
      .populate({
        path: "products.product", // Populate product details
        select: "-__v", // Exclude unnecessary fields like `__v`
      });

    if (!checkouts || checkouts.length === 0) {
      return next(new AppError("No checkouts found for this user", 404));
    }
  }

  const totalPages = Math.ceil(totalCheckoutsCount / limit);

  // Send the paginated response with complete checkout data
  res.status(200).json({
    message: "Success",
    results: checkouts.length,
    totalCheckoutsCount,
    totalPages,
    currentPage: page,
    checkouts,
  });
});

module.exports.getPendingCheckoutsCtr = catchAsyncErrors(
  async (req, res, next) => {
    const userId = req.user.id;
    const { pageNumber = 1, CHECKOUTS_PER_PAGE = 10 } = req.query; // Default values for pagination
    const page = parseInt(pageNumber, 10);
    const limit = parseInt(CHECKOUTS_PER_PAGE, 10);
    const skip = (page - 1) * limit;

    let checkouts, totalCheckoutsCount;

    // Admins get pending checkouts for all users
    if (req.user.isAdmin) {
      totalCheckoutsCount = await Checkout.countDocuments({
        status: "pending",
      });
      checkouts = await Checkout.find({ status: "pending" })
        .skip(skip)
        .limit(limit)
        .populate({
          path: "user",
          select: "-password", // Exclude password field
        })
        .populate("products.product");
    } else {
      // Regular users get only their pending checkouts
      totalCheckoutsCount = await Checkout.countDocuments({
        user: userId,
        status: "pending",
      });
      checkouts = await Checkout.find({ user: userId, status: "pending" })
        .skip(skip)
        .limit(limit)
        .populate({
          path: "user",
          select: "-password", // Exclude password field
        })
        .populate("products.product");

      if (!checkouts || checkouts.length === 0) {
        return next(
          new AppError("No pending checkouts found for this user", 404)
        );
      }
    }

    const totalPages = Math.ceil(totalCheckoutsCount / limit);

    // Send the paginated response
    res.status(200).json({
      success: true,
      results: checkouts.length,
      totalCheckoutsCount,
      totalPages,
      currentPage: page,
      checkouts,
    });
  }
);
