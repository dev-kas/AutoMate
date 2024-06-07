import Editor from './Editor'

interface Props {
  setCode: (data: string) => void
}

function PreviewPane({ setCode }: Props): JSX.Element {
  return (
    <div className="bg-[#43474f] w-full h-[calc(100%-70px)] text-white flex flex-col -xp-4 outline-none">
      <Editor
        onCodeChange={(value: string) => {
          return setCode(value)
        }}
      />
    </div>
  )
}

export default PreviewPane
