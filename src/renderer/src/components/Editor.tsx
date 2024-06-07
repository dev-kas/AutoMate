import { useState } from 'react'
import { Controlled as CodeMirror } from 'react-codemirror2'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/material-darker.css'
// import 'codemirror/mode/javascript/javascript'
// import '../syntax/AutoMateScript.syntax'
// import '../assets/CodeMate-Dark.css'
import '../assets/editor.css'

interface Props {
  onCodeChange: (value: string) => void
}

function Editor({ onCodeChange }: Props): JSX.Element {
  const [code, setCode] = useState('')
  return (
    <div className="bg-[#00000033] w-full h-full text-white flex flex-col p-4 outline-none">
      {/* <span className="text-xl font-bold">Lorem, ipsum.</span>
      <span className="text-md">Lorem ipsum dolor sit amet consectetur adipisicing elit.</span> */}
      <CodeMirror
        value={code}
        options={{
          mode: 'text',
          lineNumbers: true,
          theme: 'material-darker'
        }}
        onBeforeChange={(_editor, _data, value) => {
          setCode(value)
          onCodeChange(value)
        }}
        className="w-full h-full code-editor km-editor"
      />
    </div>
  )
}

export default Editor
