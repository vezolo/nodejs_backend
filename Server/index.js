// initialized express server
const express = require('express');
const http = require("http");
require('dotenv').config()

const app = express();
const port = process.env.PORT
const server = http.createServer(app);



server.listen(port, () => {
    console.log("listening on port " + port);
});