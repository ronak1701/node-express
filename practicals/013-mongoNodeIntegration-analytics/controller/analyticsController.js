const Order = require("../models/oderModel")
const Product = require("../models/productModel")
const User = require("../models/usersModel")

async function getTotalRevenue(req,res){
    try{
        const totalRevenue = await Order.aggregate([
            {
                $unwind : "$items"
            },
            {
                $lookup : {
                    from : "products",
                    localField : "items.productId",
                    foreignField : "id",
                    as : "product"
                }
            },
            {
                $unwind : "$product"
            },
            {
                $group : {
                    _id : null,
                    totalRevenue : { $sum : {
                        $multiply : ["$items.quantity","$product.price"]
                    } },
                    totalOrders : { $sum : 1 }
                }
            }
        ])
        return res.status(200).send(totalRevenue)
    }catch(error){
        return res.status(500).send(error)
    }
}

async function totalSpendingPerUser(re,res) {
    try{
        const totalSpendingPerUser = await Order.aggregate([
            {
                $unwind : "$items"
            },
            {
                $lookup : {
                    from : "products",
                    localField : "items.productId",
                    foreignField : "id",
                    as : "product"
                }
            },
            {
                $unwind : "$product"
            },
            {
                $group : {
                    _id : "$userId",
                    totalSpending : { $sum : {
                        $multiply : ["$items.quantity","$product.price"]
                    } },
                    totalOrders : { $sum : 1 }
                }
            }
        ])
        return res.status(200).send(totalSpendingPerUser)
    }catch(error){
        return res.status(500).send(error)
    }
}

async function totalSpendingPerCategory(re,res) {
    try{
        const totalSpendingPerCategory = await Order.aggregate([
            {
                $unwind : "$items"
            },
            {
                $lookup : {
                    from : "products",
                    localField : "items.productId",
                    foreignField : "id",
                    as : "product"
                }
            },
            {
                $unwind : "$product"
            },
            {
                $group : {
                    _id : "$product.category",
                    totalSpending : { $sum : {
                        $multiply : ["$items.quantity","$product.price"]
                    } },
                    totalOrders : { $sum : 1 }
                }
            },
            {
                $project : {
                    _id : 0,
                    category : "$_id",
                    totalSpending : 1,
                    totalOrders : 1
                }
            }
        ])
        return res.status(200).send(totalSpendingPerCategory)
    }catch(error){
        return res.status(500).send(error)
    }
}

module.exports = {getTotalRevenue,totalSpendingPerUser, totalSpendingPerCategory}