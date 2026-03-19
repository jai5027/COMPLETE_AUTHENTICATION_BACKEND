const mongoose = require('mongoose')


const sessionSchema = new mongoose.Schema({
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: [true, "User is required"]
      },

      refreshTokenHash: {
        type: String,
        required: [true, "Refresh token is required"]
      },

      ip: {
        type: String,
        required: [true, "IP address are required"]
      },

      userAgent: {
        type: String,
        required: [true, "User agen is required"]
      },

      revoked: {
        type: Boolean,
        default: false
      }
}, {
    timestamps: true
})

const sessionModel = mongoose.model("sessions", sessionSchema)
module.exports = sessionModel