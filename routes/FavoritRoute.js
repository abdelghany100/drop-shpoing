const router = require('express').Router();
const { AddToFavoriteCtr,getAllFavoritesCtr , deleteFavoriteCtr } = require('../controller/FavoriteController');
const validateObjectid = require('../middlewares/validateObjectid');
const { verifyToken , verifyTokenAndAdmin, verifyTokenAndOnlyUser} = require("../middlewares/verifyToken");

router.route("/:id").post(validateObjectid , verifyToken , AddToFavoriteCtr)
router.route("/:id").get(validateObjectid ,verifyTokenAndOnlyUser, getAllFavoritesCtr)
router.route("/:id/:idFav").delete(validateObjectid ,verifyTokenAndOnlyUser, deleteFavoriteCtr)

module.exports = router
