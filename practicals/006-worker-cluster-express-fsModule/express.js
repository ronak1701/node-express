const express = require('express')
let data = require('./MOCK_DATA.json')
const fs = require('fs')
const app = express()


app.use(express.json())

// Middleware
app.use((req,res,next)=>{
    console.log("Middleware")
    fs.appendFile("log.txt",`\n ${new Date()} Request data : ${req.method} ${req.url}`,(err)=>{
        next()
    })    
})


//get
app.get('/users',(req,res)=>{
    const response = `<ul>
     ${data.map((item)=>`<li>${item.id}</li> <li>${item.first_name}</li>`).join('')}
    </ul>`
    res.send(response)
})

//if method endPoints are same then use route
app.route('/api/users')
.get((req,res)=>{
    res.json(data)
})
.post((req,res)=>{
    if(!req?.body?.first_name){
        res.status(400).send("Bad Request")
    }
    data.push({
        id:data.length,
        ...req.body
    })
    fs.writeFile("MOCK_DATA.json",JSON.stringify(data),(err)=>{
        if(err){
            res.status(500).send("Internal Server Error")
        }
    })
    res.status(201).json({message:"User created",id:data.length-1})
})

app.get('/api/users/:id',(req,res)=>{
    if(!req.params.id){
        res.status(400).send("Bad Request")
    }
    const userId = parseInt(req.params.id)
    const user = data.find((item)=>item.id===userId)
    if(!user){
        res.status(404).send("User not found")
    }
    res.json(user)
})

//PATCH
app.patch('/api/users/:id',(req,res)=>{
    if(!req.params.id){
        res.status(400).send("Bad Request")
    }
    const userId = parseInt(req.params.id)
    
    const user = data.find((item)=>item.id===userId)
    if(!user){
        res.status(404).send("User not found")
    }    
    user.first_name = req.body.first_name
    const index = data.findIndex(item => item.id === userId);
    data[index] = user
    
    fs.writeFile("MOCK_DATA.json",JSON.stringify(data),(err)=>{
        if(err){
            res.status(500).send("Internal Server Error")
        }
    })
    res.status(200).json({message:"User updated",id:userId})
})

//DELETE
app.delete('/api/users/:id',(req,res)=>{
    if(!req.params.id){
        res.status(400).send("Bad Request")
    }
    const userId = parseInt(req.params.id)
    const user = data.find(item=>item.id == userId)
    if(!user){
        res.status(404).send("User not found")
    }
    data = data.filter(item=>item.id !== userId)
    fs.writeFile("MOCK_DATA.json",JSON.stringify(data),(err)=>{
        if(err){
            res.status(500).send("Internal Server Error")
        }
    })
    res.status(200).json({message:"User deleted",id:userId})

})

app.listen(8000,()=>{
    console.log("Server started")
})