const mongoose = require('mongoose')

async function connectDB(){

    try {
      await mongoose.connect(process.env.DATABASE_STRING)
      console.log("DATABASE CONNECTED SUCCESSFULLY")        
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = connectDB