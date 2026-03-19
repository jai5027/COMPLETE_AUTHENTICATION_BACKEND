const mongoose = require('mongoose')

const sessionSchema = new mongoose.Schema({
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: [true, "user is required"]
      },

      refreshTokenHash: {
        type: String,
        required: [true, "refreshtoken is required"]
      },

      ip: {
        type: String,
        required: [true, "ip is required"]
      },

      userAgent: {
        type: String,
        required: [true, "userAgent is required"]
      },

      revoke: {
        type: Boolean,
        default: false
      }, 
}, {
    timestamps: true
})



const sessionModel = mongoose.model("sessions", sessionSchema)
module.exports = sessionModel