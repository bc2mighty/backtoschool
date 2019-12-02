if(process.env.NODE_ENV !== "production"){
    require("dotenv").config({path: __dirname + "/.env"})
}

const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const app = express()
const flash = require("connect-flash")

app.use(require("express-session")({
    name: "sid",
    secret:"The milk would do that",
    resave: false,
    saveUninitialized: false
}))

app.use(flash())

app.use(function(req, res, next){
    res.locals.message = req.flash()
    next()
});

app.set("view engine","ejs")
app.set("views",__dirname + "/views")
// app.use(expressLayouts)
app.use(express.static('public'))
// app.use(bodyParser.json({limit:"5mb"}))
app.use(bodyParser.urlencoded({extended: false, limit: "10mb"}))

mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true
})

const db = mongoose.connection
db.on("error",error => console.log("Error Connecting" + error))
db.on("open", () => console.log("Connected"))

mongoose.set('useNewUrlParser', true)
mongoose.set('useFindAndModify', false)
mongoose.set('useCreateIndex', true)

const indexRouter = require("./routes/index")
const apiRouter = require("./api/index")
const userRouter = require("./routes/user")
const adminRouter = require("./routes/admin")
// const agentRouter = require("./routes/agent")

app.use("/api", apiRouter)
app.use("/", indexRouter)
app.use("/user", userRouter)
app.use("/admin", adminRouter)
// app.use("/agent", agentRouter)

app.listen(process.env.PORT || 3000, () => {
    console.log("Server started")
})
