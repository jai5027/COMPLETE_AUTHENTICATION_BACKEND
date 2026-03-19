const express = require('express')
const router = express.Router('express')
const authController = require('../controllers/auth.controller.js')

router.post('/register', authController.userRegister)

router.post('/login', authController.userLogin)

router.get('/refresh-token', authController.refreshToken)

router.get('/logout', authController.logout)

router.get('/logoutAll', authController.logoutAll)

module.exports = router