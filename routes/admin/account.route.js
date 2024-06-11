const express = require("express");
const router = express.Router();
const controller = require("../../controllers/admin/account.controller");

router.get("/", controller.index);
router.get("/create", controller.create);
router.post("/create", controller.createPost);
router.delete("/delete/:id", controller.delete);
module.exports = router;