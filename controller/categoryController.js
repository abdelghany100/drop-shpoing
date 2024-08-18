const catchAsyncErrors = require("../utils/catchAsyncErrors");
const AppError = require("../utils/AppError");
const { Category , validateCreateCategory} = require("../models/category");

/**-------------------------------------
 * @desc   Create New category
 * @router /api/category
 * @method POST
 * @access private (only admin)
 -------------------------------------*/
 module.exports.addCategoryCtr = catchAsyncErrors(async (req , res , next) => {
    const { error } = validateCreateCategory(req.body);

    if (error) {
        return next(new AppError(`${error.details[0].message}`, 400));
    }

    let category =await Category.findOne({name: req.body.name})
   

    if(category){
        return next(new AppError("this category already exist ", 400));


    }
     category = await Category.create({
       name: req.body.name,
      });
    
      res.status(201).json({ category });


 })

/**-------------------------------------
 * @desc   Delete  category
 * @router /api/category/:id
 * @method Delete
 * @access private (only admin)
 -------------------------------------*/
 module.exports.deleteCategoryCtr = catchAsyncErrors(async (req , res , next) => {

    const category = await Category.findById(req.params.id);

    // Check if category exists
    if (!category) {
      return next(new AppError('Category not found', 400));
    }
  
    // Delete the category
    await Category.findByIdAndDelete(req.params.id);
  
    // Send success response
    res.status(200).json({
      message: 'Category has been deleted successfully',
    });

 })
