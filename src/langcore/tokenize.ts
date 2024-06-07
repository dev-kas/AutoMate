export default function tokenize(inp: string): string[] {
  inp = inp.replace(/--<([\s\S]*?)>--/g, '') // Remove multi-line comments
  inp = inp.replace(/(?<!\\)--(?!\\)(.*)/g, '') // Remove single-line comments

  const lines: string[] = inp.split('\n') // multi-line delimiter (\n)
  const commands: string[] = []

  lines.forEach((line) => {
    const part: string[] = line.split(/(?<!\\)(?:\\\\)*;/g) // single line delimiter (;)
    part.forEach((p) => {
      const trimmedPart: string = p.trim()
      if (trimmedPart !== '') {
        const upperCmd: string = trimmedPart.toUpperCase()
        commands.push(upperCmd)
      }
    })
  })

  return commands
}
