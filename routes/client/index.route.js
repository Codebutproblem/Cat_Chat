const homeRouter = require("./home.route");
const userRouter = require("./user.route");
const chatRouter = require("./chat.route");
const friendRouter = require("./friend.route");
const userMiddleware = require("../../middlewares/client/user.middleware");
const authMiddleware = require("../../middlewares/client/auth.middleware");
module.exports = (app) => {
    app.use(userMiddleware.getUser);
    app.use("/", homeRouter);
    app.use("/user",userRouter);
    app.use("/chat",authMiddleware.requireAuth ,chatRouter);
    app.use("/friend", authMiddleware.requireAuth, friendRouter);
}