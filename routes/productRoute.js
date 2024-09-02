const router = require('express').Router();
const { photoUpload } = require("../middlewares/photoUpload");
const validateObjectid = require("../middlewares/validateObjectid");
const { verifyToken, verifyTokenAndAdmin } = require("../middlewares/verifyToken");

const{CreateProductCtr, updateProductCtr , updateProductImageCtr , getSingleProductCtr, DeleteProductCtr , getAllProductCtr} =  require('../controller/productController')

// api/product
router.route("/").post(verifyTokenAndAdmin ,photoUpload.array("images", 10) , CreateProductCtr)
router.route("/").get(verifyToken ,  getAllProductCtr)
router.route("/:id").put(validateObjectid,verifyTokenAndAdmin  , updateProductCtr)
router.route("/:id").get(validateObjectid,verifyToken  , getSingleProductCtr)
router.route("/:id").delete(validateObjectid,verifyTokenAndAdmin  , DeleteProductCtr)
// /api/product/update-image/:id
router
  .route("/update-image/:id")
  .put(
    validateObjectid,
    verifyTokenAndAdmin,
    photoUpload.array("images", 10),
    updateProductImageCtr
  );


 module.exports = router;