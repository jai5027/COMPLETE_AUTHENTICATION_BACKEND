const userModel = require('../models/user.model.js')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const sessionModel = require('../models/session.model.js')

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

     const refreshToken = jwt.sign({
        id: user._id
    }, process.env.JWT_SECRET, { expiresIn: "7d" })

    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex")
 
    const session = await sessionModel.create({
          user: user._id,
          refreshTokenHash,
          ip: req.ip,
          userAgent: req.headers[ "user-agent" ]
    })

    const accessToken = jwt.sign({ 
         id: user._id,
         session: session._id
     }, process.env.JWT_SECRET, { expiresIn: "15m" })
    
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    })

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
            message: "Refresh token not found"
        })
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET)

    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex")

    const session = await sessionModel.findOne({
        refreshTokenHash,
        revoked: false
    })

    if(!session){
        return res.status(401).json({
            message: "Invalid refresh token"
        })
    }

    const accessToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, { expiresIn: "15m" })

     const newRefreshToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, { expiresIn: "7d" })

     const newRefreshTokenHash = crypto.createHash("sha256").update(newRefreshToken).digest("hes")

     session.refreshTokenHash = newRefreshTokenHash
     await session.save()

    res.cookie("newrefreshToken", newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        masAge: 7 * 24 * 60 * 60 * 1000
    })

    res.status(200).json({
        message: "Access token refresh successfully",
        accessToken
    })
}

async function userLogout(req, res){
    const refreshToken = req.cookies.refreshToken

    if(!refreshToken){
        return res.status(400).json({
          message: "refreshToken not found"
        })
    }

    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex")

    const session = await sessionModel.findOne({
          refreshTokenHash,
          revoked: false
    })

    if(!session){
        return res.status(400).json({
            message: "Invalid refreshToken"
        })
    }

    session.revoked = true;
    await session.save()

    res.clearCookie("refreshToken")

    res.status(200).json({
        message: "user logout successfully"
    })
}

module.exports = { userRegister, refreshToken }