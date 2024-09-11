const { Product } = require('../models/Product');
const { User } = require('../models/User');
const Checkout = require('..//models/CheckOut');
const { Category } = require('../models/category');
const catchAsyncErrors = require('../utils/catchAsyncErrors');
module.exports.getChartsCtr = catchAsyncErrors(async (req, res, next) => {
  const totalProducts = await Product.countDocuments();
  const totalUsers = await User.countDocuments();
  const checkouts = await Checkout.find();
  const totalCheckouts = checkouts.length;
  const totalAmount = checkouts.reduce((acc, checkout) => acc + checkout.totalAmount, 0);
  const categories = await Category.find();
  
  const categoryStats = await Promise.all(
    categories.map(async (category) => {
      const productCount = await Product.countDocuments({ category: category.name });
      return { category: category.name, productCount, id: category._id };
    })
  );

  // Pagination for categoryStats
  const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
  const limit = parseInt(req.query.limit) || 10; // Default limit to 10 if not provided
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const paginatedCategoryStats = categoryStats.slice(startIndex, endIndex);

  // Send the final response
  res.status(200).json({
    status: 'SUCCESS',
    message: 'Statistics retrieved successfully',
    data: {
      totalProducts,
      totalUsers,
      totalCheckouts,
      totalAmount,
      totalCategories: categories.length,
      categoryStats: paginatedCategoryStats,
      currentPage: page,
      totalPages: Math.ceil(categoryStats.length / limit),
    },
  });
});
