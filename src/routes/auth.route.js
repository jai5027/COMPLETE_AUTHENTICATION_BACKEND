const express = require('express')
const router = express.Router()
const authController = require('../controllers/user.controller.js')

router.post('/register', authController.userRegister)

router.post('/refresh-token', authController.refreshToken)

module.exports = router