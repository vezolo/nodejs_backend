// initialized express server
const express = require('express');
const http = require("http");
const cors = require("cors");
const path = require('path')
const dotEnv = require('dotenv')
const helmet = require('helmet')
const morgan = require('morgan')
const chalk = require('chalk')
const fs = require('fs');
dotEnv.config({
    path: path.resolve(__dirname, `../Env/.env.${process.env.NODE_ENV}`).trim()
})


const app = express();
const port = process.env.PORT
app.get('/', (req, res) => {
    res.send('WORKING!')
})

const options = {
    key: fs.readFileSync('localhost.key'),
    cert: fs.readFileSync('localhost.crt'),
};

const server = http.createServer(options, app);
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
app.use(helmet())
const logger = morgan((tokens, req, res) => {
    const status = tokens.status(req, res);
    const coloredStatus = chalk.green(status);
    return `[${chalk.blue(tokens.method(req, res))}] ${chalk.yellow(tokens.url(req, res))} ${coloredStatus}`;
});
app.use(logger);

server.listen(port, () => {
    console.log("listening on port " + port);
});

module.exports = { app, io }