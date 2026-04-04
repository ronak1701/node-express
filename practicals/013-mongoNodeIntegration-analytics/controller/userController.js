const User = require("../models/usersModel")

async function getAllUsers(req,res){
    try{
        const allUsers = await User.find();
        return res.status(200).send(allUsers)
    }catch(error){
         return res.status(500).send("Internal Server Error")
    }
}

async function getUserById(req,res){
    try{
        const {id} = req.params;
        const user = await User.findOne({ id: Number(id) });
        // const user = await User.findById(id); // for _id of mongoDB database
        if(!user){
            return res.status(404).send("User not found")
        }
        return res.status(200).send(user)
    }catch(error){
        return res.status(500).send(error)
    }
}


async function createUser(req,res){
    try{       
        const {id,name,city,age} = req.body;
        if(!id || !name || !city || !age){
            return res.status(400).send("All fields are required")
        }
        const newUser = await User.create({
            id,
            name,
            age,
            city
        })
        return res.status(201).send("User created successfully")
    }catch(error){
        return res.status(500).send(error)
    }
}

async function deleteUserById (req,res) {
    try{
        const {id} = req.params;
        const user = await User.findOneAndDelete({ id: Number(id) }); // for custom numeric id
        // const user = await User.findByIdAndDelete(id); // for _id of mongoDB database
        if(!user){
            return res.status(404).send("User not found")
        }   
        return res.status(200).send("User deleted successfully")
    }catch(error){
        return res.status(500).send(error)
    }
}

async function updateUserById(req,res){
    try{
        const {id} = req.params;
        const {name,age,city} = req.body;
        const user = await User.findOneAndUpdate({ id: Number(id) }, { name, age, city }, { new: true });
        // const user = await User.findByIdAndUpdate(id, { name, age, city }, { new: true }); // for _id of mongoDB database
        if(!user){
            return res.status(404).send("User not found")
        }
        return res.status(200).send(user)
    }catch(error){
        return res.status(500).send(error)
    }
}

module.exports = {getAllUsers,getUserById,createUser,deleteUserById,updateUserById}