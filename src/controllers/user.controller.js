const userModel = require('../models/user.model.js')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

async function userRegister(req, res){

    const { username, email, password } = req.body

    if(!username || !email || !password){
        return res.status(400).json({
            message: "All Fields are required"
        })
    }

    const isUserExists = await userModel.findOne({ email })

    if(isUserExists){
        return res.status(409).json({
            message: "User Already Exists"
        })
    }

    const hash = await bcrypt.hash(password, 10)

    const user = await userModel.create({
        username, email, password: hash
    })

    const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, 
        { expiresIn: "7d" })

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, 
        { expiresIn: "15m" })  
        
    res.status(201).json({
        message: "user created successfully",
        user:{
            id: user._id,
            username: user.username,
            email: user.email
        },
        accessToken
    })    

}

async function refreshToken(req, res){
    const refreshToken = req.cookies.refreshToken

    if(!refreshToken){
        return res.status(401).json({
            message: "unauthorized"
        })
    }
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET)

    const accessToken = jwt.sign({
          id: decoded.id
    }, process.env.JWT_SECRET, { expiresIn: "15m" })

    const newRefreshToken = jwt.sign({
        id: decoded.id
    }, process.env.JWT_SECRET, { expiresIn: "7d" })

    res.cookie("newRefreshToken", newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.status(200).json({
        message: "Access token refreshed successfully",
        accessToken
    })

}

module.exports = { userRegister, refreshToken }