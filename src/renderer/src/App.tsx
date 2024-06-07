import Sidebar from './components/Sidebar'
import PreviewPane from './components/Preview_Pane'
import Actions from './components/Actions'
import { useState } from 'react'

function App(): JSX.Element {
  const [code, setCode] = useState('')
  return (
    <div className="flex flex-row w-full h-full">
      <Sidebar></Sidebar>
      <div className="h-full w-[calc(100%-250px)] flex flex-col justify-between">
        <PreviewPane setCode={setCode}></PreviewPane>
        <Actions code={code}></Actions>
      </div>
    </div>
  )
}

export default App
