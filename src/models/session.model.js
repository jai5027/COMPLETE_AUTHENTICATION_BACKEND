const mongoose = require('mongoose')

const sessionSchema = new mongoose.Schema({
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: [true, "user is required"]
      },

      refreshTokenHash: {
        type: String,
        required: [true, "Refresh Token hash is required"]
      },

      ip: {
        type: String,
        required: [true, "IP address is required"]
      },

      userAgent: {
        type: String,
        required: [true, "userAgent is required"]
      },

      revoked: {
        type: Boolean,
        default: false
      }
}, {
    timestamps: true
})

const sessionModel = mongoose.model("session", sessionSchema)

module.exports = sessionModel