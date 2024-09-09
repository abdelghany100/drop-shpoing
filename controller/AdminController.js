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
      return { category: category.name, productCount };
    })
  );

  // 5. إرسال الرد النهائي
  res.status(200).json({
    status: 'SUCCESS',
    message: 'Statistics retrieved successfully',
    data: {
      totalProducts,
      totalUsers,
      totalCheckouts,
      totalAmount,
      totalCategories: categories.length,
      categoryStats,
    },
  });
});
