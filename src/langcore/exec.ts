import path from 'path'
import { Worker } from 'worker_threads'
import * as functions from './functions'

export default function exec(...args: string[]) {
  // Filter out function names that exist in the functions object
  const functionNames = args.filter((arg) => functions[arg])

  const worker = new Worker(path.resolve(__dirname, './_worker.js'), {
    workerData: { functionNames }
  })

  worker.on('message', (message) => {
    console.log(message)
  })

  worker.on('error', (error) => {
    console.error('Worker error:', error)
  })

  worker.on('exit', (code) => {
    if (code !== 0) {
      console.error(`Worker stopped with exit code ${code}`)
    }
  })

  return {
    terminate: () => {
      worker.terminate()
      console.log('Worker terminated')
    }
  }
}
