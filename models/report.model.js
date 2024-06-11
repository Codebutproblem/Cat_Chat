const mongoose = require("mongoose");
const reportSchema = new mongoose.Schema({
    user_id: String,
    report_users: Array,
}, { timestamps: true });

const Report = mongoose.model("Report", reportSchema, "report");

module.exports = Report;