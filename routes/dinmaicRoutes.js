const express = require("express");
const {
  createDynamic,
  getAllDynamic,
  getSingleDynamic,
  updateDynamic,
  deleteDynamic,
} = require("../controller/dinamicController");
const {  verifyTokenAndAdmin } = require("../middlewares/verifyToken");
const { multiPhotoUpload } = require("../middlewares/photoUpload");

const router = express.Router();

// رفع صورة وإنشاء عنصر جديد
router.post("/", verifyTokenAndAdmin, multiPhotoUpload, createDynamic);

// الحصول على جميع العناصر
router.get("/", getAllDynamic);

// الحصول على عنصر واحد
router.get("/:id", getSingleDynamic);

// تحديث عنصر مع رفع صورة جديدة
router.put("/:id", verifyTokenAndAdmin, multiPhotoUpload, updateDynamic);

// حذف عنصر
router.delete("/:id", verifyTokenAndAdmin, deleteDynamic);

module.exports = router;
