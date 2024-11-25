const Dynamic = require("../models/Dinamic");
const AppError = require("../utils/AppError");
const catchAsyncErrors = require("../utils/catchAsyncErrors");
const fs = require("fs");
const path = require("path"); // تأكد من إضافة هذا السطر

module.exports.createDynamic = catchAsyncErrors(async (req, res, next) => {
  if (!req.files || !req.files.image || !req.files.backGround) {
    return next(new AppError("Both image and backGround are required", 400));
  }

  const { title, description, name } = req.body;

  const image = `/images/${req.files.image[0].filename}`;
  const backGround = `/images/${req.files.backGround[0].filename}`;

  const dynamic = await Dynamic.create({
    title,
    image,
    backGround,
    description,
    name,
  });

  res.status(201).json({
    status: "SUCCESS",
    message: "Dynamic item created successfully",
    data: dynamic,
  });
});

module.exports.updateDynamic = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { title, description, name } = req.body;

  const dynamic = await Dynamic.findById(id);
  if (!dynamic) {
    return next(new AppError("Dynamic item not found", 404));
  }

  // Delete old images if new ones are uploaded
  if (req.files?.image) {
    const imagePathOld = path.join(__dirname, "..", dynamic.image);
    if (fs.existsSync(imagePathOld)) {
      fs.unlinkSync(imagePathOld);
    }
    dynamic.image = `/images/${req.files.image[0].filename}`;
  }
  if (req.files?.backGround) {
    const backGroundPathOld = path.join(__dirname, "..", dynamic.backGround);
    if (fs.existsSync(backGroundPathOld)) {
      fs.unlinkSync(backGroundPathOld);
    }
    dynamic.backGround = `/images/${req.files.backGround[0].filename}`;
  }

  // Update fields
  dynamic.title = title || dynamic.title;
  dynamic.description = description || dynamic.description;
  dynamic.name = name || dynamic.name;

  await dynamic.save();

  res.status(200).json({
    status: "SUCCESS",
    message: "Dynamic item updated successfully",
    data: dynamic,
  });
});

module.exports.getSingleDynamic = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const dynamic = await Dynamic.findById(id);
  if (!dynamic) {
    return next(new AppError("Dynamic item not found", 404));
  }

  res.status(200).json({
    status: "SUCCESS",
    data: dynamic,
  });
});

module.exports.getAllDynamic = catchAsyncErrors(async (req, res, next) => {
  const dynamics = await Dynamic.find();

  res.status(200).json({
    status: "SUCCESS",
    count: dynamics.length,
    data: dynamics,
  });
});

module.exports.deleteDynamic = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const dynamic = await Dynamic.findById(id);
  if (!dynamic) {
    return next(new AppError("Dynamic item not found", 404));
  }

  // Delete images from the server
  if (dynamic.image) {
    const backGroundPathOld = path.join(__dirname, "..", dynamic.image);
    if (fs.existsSync(backGroundPathOld)) {
      fs.unlinkSync(backGroundPathOld);
    }
  }
  if (dynamic.backGround) {
    const backGroundPathOld = path.join(__dirname, "..", dynamic.backGround);
    if (fs.existsSync(backGroundPathOld)) {
      fs.unlinkSync(backGroundPathOld);
    }
  }

  await Dynamic.findByIdAndDelete(id);

  res.status(200).json({
    status: "SUCCESS",
    message: "Dynamic item deleted successfully",
  });
});
