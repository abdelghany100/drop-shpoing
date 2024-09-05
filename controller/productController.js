const {
  Product,
  validateCreateProduct,
  validateUpdateProduct,
} = require("../models/Product");
const catchAsyncErrors = require("../utils/catchAsyncErrors");
const AppError = require("../utils/AppError");
const fs = require("fs");
const path = require("path");
const {
  cloudinaryUploadImage,
  cloudinaryRemoveImage,
} = require("../utils/cloudinary");
const { Category } = require("../models/category");

/**-------------------------------------
 * @desc   Create New product
 * @router /api/product
 * @method POST
 * @access private (only admin)
 -------------------------------------*/

 module.exports.CreateProductCtr = catchAsyncErrors(async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next(new AppError("No images provided", 400));
  }

  const { error } = validateCreateProduct(req.body);
  if (error) {
    return next(new AppError(`${error.details[0].message}`, 400));
  }

  // 3. Upload photos
  const images = req.files.map((file) => ({
    url: `/images/${file.filename}`,
  }));
  // const result = await cloudinaryUploadImage(imagePath);

  const isCategory = await Category.findOne({ name: req.body.category });

  if (!isCategory) {
    return next(new AppError("This category is not found", 400));
  }

  console.log(req.body.tags); // 4. Create new product and save to DB
  const product = await Product.create({
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    saller: req.body.saller,
    image: images,
    weight: req.body.weight,
    brand: req.body.brand,
    color: req.body.color,
    theShape: req.body.theShape || "",
    specialFeatures: req.body.specialFeatures || "",
    shipping: req.body.shipping || "",
    tags: req.body.tags || [],
    category: req.body.category,
  });

  // 5. Send response to the client
  res.status(201).json({
    status: "SUCCESS",
    message: "Product created successfully",
    length: product.length,
    data: { product },
  });

  // 6. Optionally remove images from the server if you have uploaded to a cloud storage.
});


/**-------------------------------------
 * @desc   Update product
 * @router /api/product/:id
 * @method PUT
 * @access private (only admin)
 -------------------------------------*/

module.exports.updateProductCtr = catchAsyncErrors(async (req, res, next) => {
  const { error } = validateUpdateProduct(req.body);
  if (error) {
    return next(new AppError(`${error.details[0].message}`, 400));
  }

  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new AppError("product Not Found", 400));
  }

  const isCategory = await Category.findOne({ name: req.body.category });

  if (!isCategory) {
    return next(new AppError("this category is not found", 400));
  }
  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        saller: req.body.saller,
        weight: req.body.weight,
        brand: req.body.brand,
        color: req.body.color,
        theShape: req.body.theShape || "",
        specialFeatures: req.body.specialFeatures || "",
        shipping: req.body.shipping || "",
        tags: req.body.tags || [],
        category: req.body.category,
      },
    },
    { new: true }
  );

  res.status(200).json({
    status: "SUCCESS",
    message: "product updated  successfully",
    length: updatedProduct.length,
    data: { updatedProduct },
  });
});

/**-------------------------------------
 * @desc   Update product image
 * @router /api/product/upload-image/:id
 * @method PUT
 * @access private (only  admin)
 -------------------------------------*/

module.exports.updateProductImageCtr = catchAsyncErrors(
  async (req, res, next) => {
    console.log("slaknflknasl")
    if (!req.files || req.files.length === 0) {
      return next(new AppError("No images provided", 400));
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return next(new AppError("product Not Found", 400));
    }

    product.image.forEach((img) => {
      const imagePathOld = path.join(__dirname, '..', img.url);
      if (fs.existsSync(imagePathOld)) {
        fs.unlinkSync(imagePathOld);
      }
    });
  // 3. Upload photos
  const images = req.files.map((file) => ({
    url: `/images/${file.filename}`,
  }));
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id, 
      {
        $set: {
          image: images
        },
      },
      { new: true }
    );
    res.status(200).json({
      status: "SUCCESS",
      message: "product image updated  successfully",
      length: updatedProduct.length,
      data: { updatedProduct },
    });
  }
);

/**-------------------------------------
 * @desc   Get single product
 * @router /api/product/:id
 * @method GET
 * @access public
 -------------------------------------*/

module.exports.getSingleProductCtr = catchAsyncErrors(
  async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return next(new AppError("product Not Found", 400));
    }
    res.status(200).json({
      status: "SUCCESS",
      message: "",
      length: product.length,
      data: { product },
    });
  }
);
/**-------------------------------------
 * @desc   Get all product
 * @router /api/product
 * @method GET
 * @access public
 -------------------------------------*/

module.exports.getAllProductCtr = catchAsyncErrors(async (req, res, next) => {
  // const POST_PER_PAGE = 3;
  const { pageNumber, category, PRODUCT_PER_PAGE } = req.query;
  let products;
  if (pageNumber) {
    products = await Product.find()
      .skip((pageNumber - 1) * PRODUCT_PER_PAGE)
      .limit(PRODUCT_PER_PAGE)
      .sort({ createdAt: -1 });
  } else if (category) {
    products = await Product.find({ category }).sort({ createdAt: -1 });
  } else {
    products = await Product.find().sort({ createdAt: -1 });
  }
  res.status(200).json({
    status: "SUCCESS",
    message: "product updated  successfully",
    length: products.length,
    data: { products },
  });
});
/**-------------------------------------
 * @desc   delete product
 * @router /api/product/:id
 * @method DELETE
 * @access private (only admin)
 -------------------------------------*/

module.exports.DeleteProductCtr = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError("product Not Found", 400));
  }

  await Product.findByIdAndDelete(req.params.id);
  product.image.forEach((img) => {
    const imagePathOld = path.join(__dirname, '..', img.url);
    if (fs.existsSync(imagePathOld)) {
      fs.unlinkSync(imagePathOld);
    }
  });
  res.status(200).json({
    status: "SUCCESS",
    message: "product has been deleted  successfully",
  });
});
