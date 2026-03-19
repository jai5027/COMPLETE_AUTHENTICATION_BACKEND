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
    const isAlreadyRegister = await userModel.findOne({ $or: [{ username }, { email }] })

    if(isAlreadyRegister){
        return res.status(409).json({
            message: "user is already exists"
        })
    } 
    const hash = await bcrypt.hash(password, 10)
    const user = await userModel.create({
          username, email, password: hash
    })

     const refreshToken = jwt.sign({
        id: user._id
    }, process.env.JWT_SECRET, { expiresIn: "7d" })

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10)

    const session = await sessionModel.create({
          user: user._id,
          refreshTokenHash,
          ip: req.ip,
          userAgent: req.headers[ "user-agent" ],

    })

    const accessToken = jwt.sign({
          id: user._id,
          sessionId: session._id
    }, process.env.JWT_SECRET, { expiresIn: "15m" })

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.status(201).json({
        message: "user create successfully",
        user,
        accessToken
    })
}

async function userLogin(req, res){
    const { email, password } = req.body

    if(!email || !password){
        return res.status(400).json({
            message: "All Fields are required"
        })
    }

    const user = await userModel.findOne({ email })
    if(!user){
        return res.status(400).json({
            message: "user not found"
        })
    }

    const isMatch = await bcrypt.compare(password, user.password)
   if(!user){
        return res.status(400).json({
            message: "Invaild credentials"
        })
    }
    const refreshToken = jwt.sign({
          id: user._id
    }, process.env.JWT_SECRET, { expiresIn: "7d" })
    
    const refreshTokenHash = bcrypt.hash(refreshToken, 10)

    const session = await sessionModel.create({
          user: user._id,
          refreshTokenHash,
          ip: req.ip,
          userAgent: req.headers[ "user-agent" ]
    })

    const accessToken = jwt.sign({
        id: user._id
    }, process.env.JWT_SECRET, { expiresIn: "7d" })

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.status(200).json({
        message: "Logged in succesfully",
        user,
        accessToken
    })
}

async function refreshToken(req, res) {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      message: "refresh token not found"
    });
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({
      message: "Invalid refresh token"
    });
  }

  // session find karo (user + not revoked)
  const session = await sessionModel.findOne({
    user: decoded.id,
    revoked: false
  });

  if (!session) {
    return res.status(401).json({
      message: "Invalid refresh token"
    });
  }

  // compare karo (IMPORTANT)
  const isMatch = await bcrypt.compare(
    refreshToken,
    session.refreshTokenHash
  );

  if (!isMatch) {
    return res.status(401).json({
      message: "Invalid refresh token"
    });
  }

  // new access token
  const accessToken = jwt.sign(
    { id: decoded.id },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  // new refresh token (rotation)
  const newRefreshToken = jwt.sign(
    { id: decoded.id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  const newRefreshTokenHash = await bcrypt.hash(newRefreshToken, 10);

  // update session
  session.refreshTokenHash = newRefreshTokenHash;
  await session.save();

  // cookie set
  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  return res.status(200).json({
    message: "Access token refreshed successfully",
    accessToken
  });
}

async function logout(req, res) {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(400).json({
      message: "Refresh token not found"
    });
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({
      message: "Invalid refresh token"
    });
  }

  const session = await sessionModel.findOne({
    user: decoded.id,
    revoked: false
  });

  if (!session) {
    return res.status(400).json({
      message: "Session not found"
    });
  }

  const isMatch = await bcrypt.compare(
    refreshToken,
    session.refreshTokenHash
  );

  if (!isMatch) {
    return res.status(400).json({
      message: "Invalid refresh token"
    });
  }

  // revoke session
  session.revoked = true;
  await session.save();

  // cookie clear
  res.clearCookie("refreshToken");

  return res.status(200).json({
    message: "User logged out successfully"
  });
}

async function logoutAll(req, res){
    const refreshToken = req.cookies.refreshToken

    if(!refreshToken){
        return res.status(400).json({
            message: "Token not found"
        })
    }
    
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET)
    
    await sessionModel.updateMany({
        user: decoded.id,
        revoked: false
    }, {
        revoked: true
    })

    res.clearCookie("refreshToken")

    res.status(200).json({
        message: "Logged out from all devices"
    })

}

module.exports = { userRegister, userLogin, refreshToken, logout, logoutAll }