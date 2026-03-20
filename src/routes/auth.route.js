const express = require('express')
const router = express.Router()
const authController = require('../controllers/user.controller.js')

router.post('/register', authController.userRegister)

router.post('/login', authController.userLogin)

router.get('/refresh-token', authController.refreshToken)

router.get('/logout', authController.userLogout)

router.get('/logoutAll', authController.userLogoutAll)

router.get('/verify-email', authController.verifyEmail)

module.exports = router