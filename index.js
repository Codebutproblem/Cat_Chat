const express = require("express");
require("dotenv").config();
const methodOverride = require('method-override');
const flash = require('express-flash');
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MemoryStore = require('memorystore')(session);
const database = require("./config/database.js");
const route = require("./routes/client/index.route");
const bodyParser = require('body-parser');
const path = require('path');
const moment = require("moment");

const http = require('http');
const { Server } = require("socket.io");

const app = express();
const port = process.env.PORT;

const server = http.createServer(app);
const io = new Server(server);

global._io = io;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride('_method'))
app.set('views', `${__dirname}/views`);
app.set('view engine', 'pug');
app.use(cookieParser('333'));
app.use(session({
    cookie: { maxAge: 86400000 },
    store: new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    resave: false,
    secret: 'keyboard cat'
}));
app.use(flash());
app.use(express.static(`${__dirname}/public`));

app.locals.moment = moment;

database.connect();

route(app);

app.get("*", (req, res)=>{
    res.send("<h1>404</h1>");
});


server.listen(port, () => {
    console.log(`App listening on port ${port}`);
});