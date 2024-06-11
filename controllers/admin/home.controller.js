const User = require("../../models/user.model");
const Report = require("../../models/report.model");
const Account = require("../../models/account.model");
const Post = require("../../models/post.model");
module.exports.index = async (req, res) => {
  const userNumber = await User.countDocuments({ deleted: false });
  const userNumberLocked = await User.countDocuments({
    status: "inactive",
    deleted: false,
  });
  const reports = await Report.find({ deleted: false });
  const reportNumber = reports.reduce(
    (total, report) => total + report.report_users.length,
    0
  );

  const accountNumber = await Account.countDocuments({ deleted: false });
  const accountNumberAll = await Account.countDocuments({
    role: "all",
    deleted: false,
  });
  const accountNumberManager = await Account.countDocuments({
    role: "manager",
    deleted: false,
  });

  const postNumber = await Post.countDocuments({});
  const postNumberDeleted = await Post.countDocuments({ deleted: true });
  const postNumberNotDeleted = await Post.countDocuments({ deleted: false });
  const statistic = {
    userNumber: userNumber,
    userNumberLocked: userNumberLocked,
    reportNumber: reportNumber,

    accountNumber: accountNumber,
    accountNumberAll: accountNumberAll,
    accountNumberManager: accountNumberManager,

    postNumber: postNumber,
    postNumberDeleted: postNumberDeleted,
    postNumberNotDeleted: postNumberNotDeleted,
  };

  let users = await User.find({ deleted: false })
    .limit(5)
    .sort({ createdAt: -1 })
    .select("-password -token");

  
  res.render("admin/pages/home/index", {
    pageTitle: "Home",
    statistic: statistic,
    users: users,
    
  });
};
