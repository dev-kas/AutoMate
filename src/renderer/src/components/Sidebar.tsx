import Sidebar_Item from './Sidebar_Item'
// import { FaIcon } from 'react-icons/fa'

function Sidebar(): JSX.Element {
  return (
    <div className="bg-[#2b2b2b] w-[250px] h-full p-2">
      <div className="flex items-center justify-between mx-2">
        <span className="text-white text-2xl">AutoMate</span>
        <button className="hover:bg-[#19191966] p-1 rounded-xl bg-transparent transition-bg duration-150 active:bg-[#ffffff2b]">
          <svg
            fill="none"
            strokeWidth={2}
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="w-6 h-6 text-white"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      </div>
      <ul className="gap-2 flex flex-col overflow-y-auto w-full h-[calc(100%-2rem)] mt-2">
        <Sidebar_Item></Sidebar_Item>
      </ul>
    </div>
  )
}

export default Sidebar
