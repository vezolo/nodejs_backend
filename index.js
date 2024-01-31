const { app, io } = require("./Server")
require("./Lib/mongoose")
require("./Models");
const bodyParser = require("body-parser");
const token = require("./Middleware");
const routes = require("./Routes/routes")
const authRoutes = require("./Routes/Auth");

app.use(bodyParser.json());
app.use(authRoutes);

app.use("/api", token, (req, res, next) => {

    io.on("connection", (socket) => {
        console.log("connected")

        socket.on("join", (data) => {
            socket.join(`roomCall:${data?.from}`)
        })

        socket.on("disconnect", () => {
            socket.broadcast.emit("callEnded")
        });

        socket.on("callUser", (data) => {
            socket.broadcast.emit("callUser", data);
        });

        socket.on("answerCall", (data) => {
            socket.broadcast.emit("callAccepted", data)
        });

        socket.on("leave", (data) => {
            io.emit("leave", data)
        });


        app.set("socket", socket)
        app.set("io", io)
    })

    return next()
});

// use of routes
app.use("/api", routes);