export default function main(...args: string[]): void {
  const unparsedMs = args[0]
  if (typeof unparsedMs === 'undefined') {
    return
  }
  const ms = parseFloat(unparsedMs)
  if (!isNaN(ms)) {
    const start = Date.now()
    let elapsed = 0
    while (elapsed <= ms) {
      elapsed = Date.now() - start
      console.log('WAIT: elapsed', elapsed + 'ms')
    }
    console.log('WAIT: wait completed for ', ms + 'ms')
  }
}
