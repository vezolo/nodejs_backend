// initialized express server
const express = require('express');
const http = require("http");
const cors = require("cors");
const path = require('path')
const dotEnv = require('dotenv')

if (process.env.NODE_ENV === "Production") {
    dotEnv.config({
        path: path.resolve(__dirname, '../Env/.env.production')
    })
} else {
    dotEnv.config({
        path: path.resolve(__dirname, '../Env/.env.development')
    })
}


const app = express();
const port = process.env.PORT
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.use(cors());

server.listen(port, () => {
    console.log("listening on port " + port);
});

module.exports = { app, io }