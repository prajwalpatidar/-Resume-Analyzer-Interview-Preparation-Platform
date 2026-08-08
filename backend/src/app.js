// app.js is the main file of our application, it will be used to create the server and handle all the routes and middlewares. It will be imported in the server.js file where we will start the server. 

const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")

const app = express()

app.use(express.json()) // help to read req.body
app.use(cookieParser())
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))

// require all the routes here
const authRouter = require("./routes/auth.router")
const interviewRouter = require("./routes/interview.routes")

//using all the routes here
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)

// global error handler
app.use((err, req, res, next) => {
    console.error(err)
    res.status(err.status || 500).json({
        message: err.message || "Internal Server Error"
    })
})

module.exports = app