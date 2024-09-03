const router = require("express").Router();
const {
  AddToCartCtr,
  getAllCartCtr,
  deleteCartCtr,
  UpdateCartCtr,
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

module.exports = router;
