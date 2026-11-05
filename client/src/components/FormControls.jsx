export function TextField({ label, ...props }) {
  const id = props.id || props.name
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <input
        id={id}
        className="w-full rounded-xl border border-[#e4dccf] bg-white px-3 py-2.5 outline-none focus:border-[#0f7a45]"
        {...props}
      />
    </label>
  )
}

export function Button({
  children,
  variant = 'solid',
  className = '',
  type = 'button',
  ...props
}) {
  const styles =
    variant === 'solid'
      ? 'bg-[#1c1915] text-[#fffdf8]'
      : 'border border-[#e4dccf] bg-white text-[#1c1915]'

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold disabled:cursor-progress disabled:opacity-60 ${styles} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
