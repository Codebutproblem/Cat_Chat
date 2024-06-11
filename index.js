const express = require("express");
require("dotenv").config();
const methodOverride = require('method-override');
const flash = require('express-flash');
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MemoryStore = require('memorystore')(session);
const database = require("./config/database.js");
const route = require("./routes/client/index.route");
const routeAdmin = require("./routes/admin/index.route.js");
const bodyParser = require('body-parser');
const path = require('path');
const moment = require("moment");
const systemConfig = require("./config/system.js");

const http = require('http');
const { Server } = require("socket.io");
console.log(new Date());
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
    secret: '333',
    resave: false,
    saveUninitialized: false,
    store: new MemoryStore({
        checkPeriod: 86400000 // Thời gian kiểm tra và xóa các session hết hạn (milliseconds)
    })
}));
app.use(flash());
app.use('/tinymce', express.static(path.join(__dirname, 'node_modules', 'tinymce')));
app.use(express.static(`${__dirname}/public`));


app.locals.moment = moment;
app.locals.prefixAdmin = systemConfig.path_admin;
database.connect();

route(app);
routeAdmin(app);

app.get("*", (req, res)=>{
    res.send(systemConfig.error_page);
});


server.listen(port, () => {
    console.log(`App listening on port ${port}`);
});