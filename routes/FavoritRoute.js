const router = require('express').Router();
const { AddToFavoriteCtr,getAllFavoritesCtr , deleteFavoriteCtr } = require('../controller/FavoriteController');
const validateObjectid = require('../middlewares/validateObjectid');
const { verifyToken , verifyTokenAndAdmin, verifyTokenAndOnlyUser} = require("../middlewares/verifyToken");

router.route("/:id").post(validateObjectid , verifyToken , AddToFavoriteCtr)
router.route("/").get(verifyToken, getAllFavoritesCtr)
router.route("/:id").delete(validateObjectid ,verifyToken, deleteFavoriteCtr)

module.exports = router
