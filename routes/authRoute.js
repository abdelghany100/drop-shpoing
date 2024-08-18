const router = require('express').Router();


const{registerUserCtr , loginUserCtr , forgetPasswordCtr , resetPasswordCtr} =  require('../controller/authController')

// api/auth/register
router.post("/register", registerUserCtr)
router.post("/login", loginUserCtr)
router.post("/forget-password", forgetPasswordCtr)
router.post('/reset-password/:token', resetPasswordCtr);



 module.exports = router;