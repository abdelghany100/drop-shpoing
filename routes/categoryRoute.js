const router = require('express').Router();
const photoUpload = require("../middlewares/photoUpload");
const validateObjectid = require("../middlewares/validateObjectid");
const { verifyToken , verifyTokenAndAdmin} = require("../middlewares/verifyToken");

const{addCategoryCtr, getAllCategoryCtr,deleteCategoryCtr} =  require('../controller/categoryController')

// api/product
router.route("/").post(verifyTokenAndAdmin ,  addCategoryCtr)
router.route("/").get(verifyTokenAndAdmin ,  getAllCategoryCtr)
router.route("/:id").delete(validateObjectid ,verifyTokenAndAdmin ,  deleteCategoryCtr)




 module.exports = router;