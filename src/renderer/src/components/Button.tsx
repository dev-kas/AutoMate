import clsx from 'clsx'

interface Props {
  variant: 'primary' | 'secondary' | 'tertiary'
  children: JSX.Element | string
  onClick?: () => void
  disabled?: boolean
}

function Button({ variant, children, onClick, disabled }: Props): JSX.Element {
  return (
    <button
      className={clsx(
        `
        flex
        flex-col
        px-4
        py-2
        rounded-lg
        outline-none
        justify-center
        items-center
        transition-bg
        duration-150
        disabled:cursor-not-allowed
        disabled:brightness-75
        disabled:hover:brightness-80
      `,
        variant === 'primary' && 'bg-[#5151e9] hover:bg-[#676de6] active:bg-[#5858a5]',
        variant === 'secondary' && 'bg-[#3b3d41] hover:bg-[#525457] active:bg-[#3f3f3f]',
        variant === 'tertiary' && 'ring-2 ring-[#6a6a6a] hover:bg-[#69696926] active:bg-[#ffffff2a]'
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

export default Button
