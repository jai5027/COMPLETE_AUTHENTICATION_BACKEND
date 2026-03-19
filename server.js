const app = require('./src/app.js')
const dotenv = require('dotenv')
dotenv.config()
const connectDB = require('./src/config/database.js')

connectDB()
app.listen(3000, () => {
    console.log('Server is running on port 3000')
})