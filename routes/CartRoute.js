const router = require("express").Router();
const {
  AddToCartCtr,
  getAllCartCtr,
  deleteCartCtr,
  UpdateCartCtr,
  CheckOutCartCtr,
  getAllCheckoutsCtr,
  completeCheckOutCtr,
  getPendingCheckoutsCtr,
} = require("../controller/cartController");
const validateObjectid = require("../middlewares/validateObjectid");
const {
  verifyToken,
  verifyTokenAndAdmin,
  verifyTokenAndOnlyUser,
} = require("../middlewares/verifyToken");

router.post("/checkout",verifyToken, CheckOutCartCtr);
router.route("/").get(verifyToken, getAllCartCtr);
router
.route("/:id")
.post(validateObjectid, verifyToken, AddToCartCtr)
.delete(validateObjectid, verifyToken, deleteCartCtr)
.patch(validateObjectid, verifyToken, UpdateCartCtr);

router
.route("/CompleteCheckout/:checkoutId")
.post(verifyToken, completeCheckOutCtr);
router.get("/AllCheckout", verifyToken, getAllCheckoutsCtr);
router.get("/getPendingCheckoutsCtr", verifyToken, getPendingCheckoutsCtr);

module.exports = router;
