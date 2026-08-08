// server.js is the entry point of our application, it will be used to start the server and listen on a specific port. It will import the app.js file where we will create the server and handle all the routes and middlewares.
require("dotenv").config()
const app = require("./src/app")
const connectToDB = require("./src/config/database")

connectToDB()

app.listen(3000, () => {
    console.log("Server is running on port 3000")
})