const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
      username: {
        type: String,
        required: [true, "username is required"],
        unique: true
      },

      email: {
        type: String,
        require: [true, "email is required"],
        unique: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "regex are required"]
      },

      password: {
        type: String,
        required: [true, "password is required"]
      }
})

const userModel = mongoose.model('user', userSchema)

module.exports = userModel