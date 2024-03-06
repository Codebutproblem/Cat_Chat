const express = require("express");
const router = express.Router();
const controller = require("../../controllers/client/friend.controller");
router.get("/add", controller.addFriend);
router.get("/accept", controller.acceptFriend);
router.get("/list", controller.friend);
module.exports = router;