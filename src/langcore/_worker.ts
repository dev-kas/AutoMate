import { parentPort, workerData } from 'worker_threads'
import * as functions from './functions'

function runTasks(functionNames: string[]) {
  for (const functionName of functionNames) {
    const func = functions[functionName]
    if (func) {
      func()
    }
  }
}

const { functionNames } = workerData
runTasks(functionNames)

parentPort?.postMessage('Worker finished execution')
