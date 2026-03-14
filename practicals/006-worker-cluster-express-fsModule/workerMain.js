async function workerModule(data) {
  return new Promise((resolve, reject) => {
    const worker_thread = new Worker('./worker.js',{workerData: data})
    worker_thread.on('message',resolve);
    worker_thread.on('error',reject);
    worker_thread.on('exit',code => {
      if(code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`))
      }
    })
  })  
}

async function mainModule() {
    console.log('Running here 1')
    const result = await workerModule(1e9).then((result) => {
        console.log(result)
    })
    console.log('running here 2')

}

mainModule()
console.log("2. Main thread is NOT blocked!");