const jwt = require('jsonwebtoken')
const userModel = require('../models/user.model.js')

async function authMiddelware(req, res, next){

    const token = res.cookies.token || req.headers.authorization?.split(" ")[ 1 ]

    if(!token){
        return res.status(401).json({
            message: "Unauthorized"
        })
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await userModel.findOne( decoded.id )

    req.user = user
    next()

    res.status(200).json({
        message: "user fetched successfully",
        user
    })
}

module.export = { authMiddelware }