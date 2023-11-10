const { app, io } = require("./Server")
require("./Lib/mongoose")
require("./Models");
const bodyParser = require("body-parser");
const token = require("./Middleware");
const routes = require("./Routes/routes")
const authRoutes = require("./Routes/Auth")

app.use(bodyParser.json());
app.use(authRoutes);

// middleware
app.use("/", token, (req, res, next) => {

    io.on("connection", (socket) => {
        console.log("connected")

        req.io = io
        req.socket = socket
    })

    next()
});

// use of routes
app.use("/api", routes);