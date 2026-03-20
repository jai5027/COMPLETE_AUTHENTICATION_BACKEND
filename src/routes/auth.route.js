const express = require('express')
const router = express.Router()
const authController = require('../controllers/user.controller.js')

router.post('/register', authController.userRegister)

router.get('/refresh-token', authController.refreshToken)

router.get('/logout', authController.userLogout)

module.exports = router