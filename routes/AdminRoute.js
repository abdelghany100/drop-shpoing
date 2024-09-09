const { getChartsCtr } = require('../controller/AdminController');
const { verifyToken } = require('../middlewares/verifyToken');

const router = require('express').Router();



router.get("/chart" , verifyToken , getChartsCtr )

module.exports = router;