const cluster = require('cluster')
const os = require('os')
const express = require('express')

const totalCPUs = os.cpus().length
console.log(totalCPUs)

if(cluster.isPrimary){
    console.log(`Master ${process.pid} is running`)
    
    for(let i=0;i<totalCPUs;i++){
        cluster.fork()
    }

    cluster.on('exit',()=>{
        console.log('worker died')
        cluster.fork()
    })
}else{
    const app = express()

    app.get('/',(req,res)=>{
        res.send(`Response sent from ${process.pid}`)
    })
    app.listen(8000,()=>{
        console.log(`worker ${process.pid} started`)
    })
}