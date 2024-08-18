const catchAsyncErrors = require("../utils/catchAsyncErrors");
const AppError = require("../utils/AppError");
const Favorite = require("../models/favoret");
const { Product } = require("../models/Product");

/**-------------------------------------
 * @desc   add to favorites
 * @router /api/favorites
 * @method POST
 * @access private (only login)
 -------------------------------------*/
module.exports.AddToFavoriteCtr = catchAsyncErrors(async (req, res, next) => {
  // check product found
   
 

  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new AppError("product Not Found", 400));
  }
  const isFavorite = await Favorite.findOne({product: req.params.id , user: req.user.id})
  if (isFavorite) {
    return next(new AppError("product already added", 400));

  }
  const fav = await Favorite.create({
    user: req.user.id,
    product: req.params.id,
    
   
  });

  res.status(201).json({ fav });
});
/**-------------------------------------
 * @desc   get all favorite products
 * @router /api/favorite
 * @method POST
 * @access private (only login and user)
 -------------------------------------*/
module.exports.getAllFavoritesCtr = catchAsyncErrors(async (req, res, next) => {
  // check product found

  
  const favorites = await Favorite.find({ user: req.user.id }).populate("product");
  if (!favorites) {
    return next(new AppError("product Not Found", 400));
  }

  res.status(201).json(favorites);
});
/**-------------------------------------
 * @desc   delete favorites
 * @router /api/favorite
 * @method Delete
 * @access private (only login and user)
 -------------------------------------*/
module.exports.deleteFavoriteCtr = catchAsyncErrors(async (req, res, next) => {

  const favorite = await Favorite.findById(req.params.idFav)
  if (!favorite) {
    return next(new AppError("product Not Found", 400));
  }

  await Favorite.findByIdAndDelete(req.params.idFav)

  res.status(201).json({message : "deleted successful"});
});


