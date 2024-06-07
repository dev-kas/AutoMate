function Sidebar_Item(): JSX.Element {
  return (
    <li className="hover:bg-[#19191966] bg-transparent transition-bg duration-150 p-2 rounded-md text-white flex flex-col active:bg-[#ffffff2b]">
      <span className="text-xl font-bold">Lorem, ipsum.</span>
      <span className="text-md truncate">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Hic inventore beatae recusandae
        perspiciatis porro nesciunt consequuntur dolores aliquid dolorum sed.
      </span>
    </li>
  )
}

export default Sidebar_Item
