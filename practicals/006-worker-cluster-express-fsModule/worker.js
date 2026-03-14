const {workerData,parentPort} = require('worker_threads')
let total=0
for(let i=0;i<workerData;i++) {
    total += i
}
parentPort.postMessage(total)