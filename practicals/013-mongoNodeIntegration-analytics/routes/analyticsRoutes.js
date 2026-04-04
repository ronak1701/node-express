const express = require("express")
const { getTotalRevenue,totalSpendingPerUser,totalSpendingPerCategory } = require("../controller/analyticsController")

const analyticsRouter = express.Router();

analyticsRouter.get("/totalRevenue",getTotalRevenue)
                .get("/totalSpendingPerUser",totalSpendingPerUser)
                .get("/totalSpendingPerCategory",totalSpendingPerCategory)

module.exports = analyticsRouter;
