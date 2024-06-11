const express = require("express");
const router = express.Router();
const controller = require("../../controllers/client/chat.controller");
const chatMiddleware = require("../../middlewares/client/chat.middleware");
router.get("/room/:room_id",chatMiddleware.isJoin, controller.index);
router.get("/stranger", controller.stranger);
router.get("/stranger/queue", controller.inQueue);
router.get("/stranger/room/:room_id", controller.chatWStranger);
module.exports = router;