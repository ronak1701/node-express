const express = require("express");
const { connectDB } = require("./connection");
const router = require("./routes/userRoute");
const analyticsRouter = require("./routes/analyticsRoutes");

const app =express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB("mongodb://localhost:27017/eCommerce")

app.use("/api/users",router)
app.use("/api/analytics",analyticsRouter)

app.listen(5000,()=>{
    console.log(`Server is running on port 5000`)
})