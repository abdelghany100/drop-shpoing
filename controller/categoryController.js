const catchAsyncErrors = require("../utils/catchAsyncErrors");
const AppError = require("../utils/AppError");
const { Category, validateCreateCategory } = require("../models/category");

/**-------------------------------------
 * @desc   Create New category
 * @router /api/category
 * @method POST
 * @access private (only admin)
 -------------------------------------*/
module.exports.addCategoryCtr = catchAsyncErrors(async (req, res, next) => {
  const { error } = validateCreateCategory(req.body);

  if (error) {
    return next(new AppError(`${error.details[0].message}`, 400));
  }

  let category = await Category.findOne({ name: req.body.name });

  if (category) {
    return next(new AppError("this category already exist ", 400));
  }
  category = await Category.create({
    name: req.body.name,
  });

  res.status(200).json({
    status: "SUCCESS",
    message: "category created successfully",
    length: category.length,
    data: { category },
  });
});

/**-------------------------------------
 * @desc   Delete  category
 * @router /api/category/:id
 * @method Delete
 * @access private (only admin)
 -------------------------------------*/
module.exports.deleteCategoryCtr = catchAsyncErrors(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  // Check if category exists
  if (!category) {
    return next(new AppError("Category not found", 400));
  }

  // Delete the category
  await Category.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: "SUCCESS",
    message: "Category has been deleted successfully",
  });
  // Send success response
});

/**-------------------------------------
 * @desc   Get all categories
 * @router /api/category
 * @method GET
 * @access public
 -------------------------------------*/
 module.exports.getAllCategoryCtr = catchAsyncErrors(async (req, res, next) => {
  const { pageNumber = 1, CATEGORIES_PER_PAGE = 10 } = req.query; // Default values
  const page = parseInt(pageNumber, 10);
  const limit = parseInt(CATEGORIES_PER_PAGE, 10);
  const skip = (page - 1) * limit;

  // Fetch categories with pagination
  const categories = await Category.find().skip(skip).limit(limit);
  const totalCategoryCount = await Category.countDocuments();

  // Check if categories exist
  if (!categories || categories.length === 0) {
    return next(new AppError("No categories found", 404));
  }

  const totalPages = Math.ceil(totalCategoryCount / limit);

  // Send success response
  res.status(200).json({
    status: "SUCCESS",
    length: categories.length,
    totalCategoryCount,
    totalPages,
    currentPage: page,
    data: {
      categories,
    },
  });
});

