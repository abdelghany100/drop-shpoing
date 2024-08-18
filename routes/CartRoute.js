const router = require('express').Router();
const { AddToCartCtr, getAllCartCtr, deleteCartCtr } = require('../controller/cartController');
const validateObjectid = require('../middlewares/validateObjectid');
const { verifyToken , verifyTokenAndAdmin, verifyTokenAndOnlyUser} = require("../middlewares/verifyToken");

router.route("/:id").post(validateObjectid , verifyToken , AddToCartCtr)
router.route("/:id").get(validateObjectid ,verifyTokenAndOnlyUser, getAllCartCtr)
router.route("/:id/:idCart").delete(validateObjectid ,verifyTokenAndOnlyUser, deleteCartCtr)

module.exports = router
