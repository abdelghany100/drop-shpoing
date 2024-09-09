const router = require("express").Router();
const {
  AddToCartCtr,
  getAllCartCtr,
  deleteCartCtr,
  UpdateCartCtr,
  CheckOutCartCtr,
} = require("../controller/cartController");
const validateObjectid = require("../middlewares/validateObjectid");
const {
  verifyToken,
  verifyTokenAndAdmin,
  verifyTokenAndOnlyUser,
} = require("../middlewares/verifyToken");

router.route("/").get(verifyToken, getAllCartCtr);
router
  .route("/:id")
  .post(validateObjectid, verifyToken, AddToCartCtr)
  .delete(validateObjectid, verifyToken, deleteCartCtr)
  .patch(validateObjectid, verifyToken, UpdateCartCtr);

  router.route("/checkout").get(verifyToken ,CheckOutCartCtr )
  module.exports = router;
