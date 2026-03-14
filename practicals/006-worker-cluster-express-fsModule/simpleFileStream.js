const fs = require('fs')
const express = require('express')
const app = express()

app.use(express.json())

app.get('/',(req,res)=>{
   const readStream = fs.createReadStream('./MOCK_DATA.json')
   readStream.on('data',(chunk)=>{
    console.log('data sent')
    res.write(chunk)
   })
   readStream.on('end',()=>{
    res.end()
   })
})

app.listen(8000,()=>{
    console.log("Server started")
})