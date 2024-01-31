// initialized express server
const express = require('express');
const http = require("http");
const cors = require("cors");
const path = require('path')
const dotEnv = require('dotenv')

dotEnv.config({
    path: path.resolve(__dirname, `../Env/.env.${process.env.NODE_ENV}`).trim()
})

const app = express();
const port = process.env.PORT
const server = http.createServer(app);
const { Server } = require("socket.io");

const corsOption = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: false,
}

const io = new Server(server, {
    cors: corsOption
});

app.use(cors(corsOption));

server.listen(port, () => {
    console.log("listening on port " + port);
});

module.exports = { app, io }