const express = require("express");
const {
  getSingleUserCtr,
  deleteUserCtr,
  getAllUsersCtr,
} = require("../controller/userController");
const { verifyTokenAndAdmin } = require("../middlewares/verifyToken");
const router = express.Router();

router.get("/" , verifyTokenAndAdmin, getAllUsersCtr);

router.get("/:userId",verifyTokenAndAdmin ,getSingleUserCtr);

router.delete("/:userId", verifyTokenAndAdmin,deleteUserCtr);



module.exports = router;
