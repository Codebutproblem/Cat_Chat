const adminPath = require("../../config/system");
const homeRouter = require("./home.route");
const userRouter = require("./user.route");
const postRouter = require("./post.route");
const accountRouter = require("./account.route");
const authRouter = require("./auth.route");
const Auth = require("../../middlewares/admin/auth.middleware");
module.exports = (app) => {
    const path = adminPath.path_admin;
    app.use(path + "/auth", authRouter);
    app.use(path + "/home", Auth.requireAuth, homeRouter);
    app.use(path + "/users", Auth.requireAuth, userRouter);
    app.use(path + "/posts", Auth.requireAuth, postRouter);
    app.use(path + "/accounts", Auth.requireAuth, accountRouter);
}