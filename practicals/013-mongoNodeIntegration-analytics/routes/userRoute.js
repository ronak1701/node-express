const express = require("express")
const { getAllUsers,createUser,getUserById,deleteUserById,updateUserById } = require("../controller/userController")

const router = express.Router();

router.get("/",getAllUsers).post("/",createUser)
router.get("/:id",getUserById).delete("/:id",deleteUserById).put("/:id",updateUserById)


module.exports = router;
