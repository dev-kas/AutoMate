import { useState, useEffect } from 'react'
import Button from './Button'

interface Props {
  code: string
}

enum RecordButtonText {
  Record = 'Record',
  Stop = 'Stop',
  Three = '3',
  Two = '2',
  One = '1'
}

enum RunButtonText {
  Run = 'Run',
  Stop = 'Stop',
  Three = '3',
  Two = '2',
  One = '1'
}

function Actions({ code }: Props): JSX.Element {
  const [recBtnText, setRecBtnText] = useState<RecordButtonText>(RecordButtonText.Record)
  const [runBtnText, setRunBtnText] = useState<RunButtonText>(RunButtonText.Run)

  const { electron } = window

  useEffect(() => {
    let twoTime: NodeJS.Timeout | null = null
    let oneTime: NodeJS.Timeout | null = null
    if (recBtnText === RecordButtonText.Record) {
      return
    }

    if (recBtnText === RecordButtonText.Stop) {
      if (twoTime) clearTimeout(twoTime)
      if (oneTime) clearTimeout(oneTime)
    } else {
      twoTime = setTimeout(() => {
        setRecBtnText(RecordButtonText.Two)
      }, 1000)
      oneTime = setTimeout(() => {
        setRecBtnText(RecordButtonText.One)
      }, 2000)
    }

    return () => {
      if (twoTime) clearTimeout(twoTime)
      if (oneTime) clearTimeout(oneTime)
    }
  }, [recBtnText])

  function recClick(): void {
    if (recBtnText === RecordButtonText.Record) {
      setRecBtnText(RecordButtonText.Three)
      setTimeout(() => {
        setRecBtnText(RecordButtonText.Two)
      }, 1000)
      setTimeout(() => {
        setRecBtnText(RecordButtonText.One)
      }, 2000)
      setTimeout(() => {
        setRecBtnText(RecordButtonText.Stop)
        recStart()
      }, 3000)
    } else {
      setRecBtnText(RecordButtonText.Record)
      recStop()
    }
  }

  function recStart(): void {
    electron.ipcRenderer.send('record:start')
    console.log('Recording Started')
  }

  function recStop(): void {
    electron.ipcRenderer.send('record:stop')
    console.log('Recording Stopped')
  }

  // next

  useEffect(() => {
    let twoTime: NodeJS.Timeout | null = null
    let oneTime: NodeJS.Timeout | null = null
    if (runBtnText === RunButtonText.Run) {
      return
    }

    if (runBtnText === RunButtonText.Stop) {
      if (twoTime) clearTimeout(twoTime)
      if (oneTime) clearTimeout(oneTime)
    } else {
      twoTime = setTimeout(() => {
        setRunBtnText(RunButtonText.Two)
      }, 1000)
      oneTime = setTimeout(() => {
        setRunBtnText(RunButtonText.One)
      }, 2000)
    }

    return () => {
      if (twoTime) clearTimeout(twoTime)
      if (oneTime) clearTimeout(oneTime)
    }
  }, [runBtnText])

  function runClick(): void {
    if (runBtnText === RunButtonText.Run) {
      setRunBtnText(RunButtonText.Three)
      setTimeout(() => {
        setRunBtnText(RunButtonText.Two)
      }, 1000)
      setTimeout(() => {
        setRunBtnText(RunButtonText.One)
      }, 2000)
      setTimeout(() => {
        setRunBtnText(RunButtonText.Stop)
        runStart()
      }, 3000)
    } else {
      setRunBtnText(RunButtonText.Run)
      runStop()
    }
  }

  function runStart(): void {
    electron.ipcRenderer.send('run:start', { code, id: 'wasd' })
    console.log('Run Started')
  }

  function runStop(): void {
    electron.ipcRenderer.send('run:stop')
    console.log('Run Stopped')
  }

  // events

  electron.ipcRenderer.on('run:finished', () => {
    setRunBtnText(RunButtonText.Run)
  })

  return (
    <div className="bg-[#363636] w-full h-[70px] text-white flex flex-row-reverse p-4 justify-between items-center">
      <div className="flex flex-row gap-2">
        <Button
          disabled={
            runBtnText === RunButtonText.One ||
            runBtnText === RunButtonText.Two ||
            runBtnText === RunButtonText.Three ||
            recBtnText === RecordButtonText.One ||
            recBtnText === RecordButtonText.Two ||
            recBtnText === RecordButtonText.Three ||
            recBtnText === RecordButtonText.Stop
          }
          onClick={runClick}
          variant="primary"
        >
          {runBtnText}
        </Button>
      </div>
      <div className="flex flex-row gap-2">
        <Button
          disabled={
            recBtnText === RecordButtonText.One ||
            recBtnText === RecordButtonText.Two ||
            recBtnText === RecordButtonText.Three ||
            runBtnText === RunButtonText.Stop ||
            runBtnText === RunButtonText.One ||
            runBtnText === RunButtonText.Two ||
            runBtnText === RunButtonText.Three
          }
          onClick={recClick}
          variant="secondary"
        >
          {recBtnText}
        </Button>
      </div>
      <div className="flex flex-row gap-2">
        <Button variant="tertiary">Info</Button>
      </div>
    </div>
  )
}

export default Actions
