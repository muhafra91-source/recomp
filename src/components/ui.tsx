import type { PropsWithChildren, ReactNode } from 'react'

export function Card({ children, className = '' }: PropsWithChildren<{ className?: string }>) {
  return (
    <div className={`rounded-2xl bg-slate-800/60 border border-slate-700/60 p-4 ${className}`}>
      {children}
    </div>
  )
}

export function SectionTitle({ children }: PropsWithChildren) {
  return <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400 mb-2">{children}</h2>
}

export function ProgressBar({
  value,
  target,
  color = 'bg-emerald-500',
}: {
  value: number
  target: number
  color?: string
}) {
  const pct = target > 0 ? Math.min(100, (value / target) * 100) : 0
  return (
    <div className="h-2.5 w-full rounded-full bg-slate-700/70 overflow-hidden">
      <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
    </div>
  )
}

export function StatTile({
  label,
  value,
  sub,
  icon,
}: {
  label: string
  value: ReactNode
  sub?: ReactNode
  icon?: ReactNode
}) {
  return (
    <Card className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-slate-400">
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
        {icon}
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {sub && <div className="text-xs text-slate-400">{sub}</div>}
    </Card>
  )
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  type = 'button',
  className = '',
  disabled,
  ...rest
}: PropsWithChildren<
  {
    onClick?: () => void
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
    type?: 'button' | 'submit'
    className?: string
    disabled?: boolean
  } & React.ButtonHTMLAttributes<HTMLButtonElement>
>) {
  const variants: Record<string, string> = {
    primary: 'bg-emerald-500 text-slate-900 font-semibold active:bg-emerald-400',
    secondary: 'bg-slate-700 text-slate-100 font-medium active:bg-slate-600',
    danger: 'bg-red-500/15 text-red-400 font-medium active:bg-red-500/25',
    ghost: 'bg-transparent text-slate-300 font-medium active:bg-slate-800',
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl px-4 py-3 text-sm transition-colors disabled:opacity-40 disabled:pointer-events-none ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

export function Input({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <label className="flex flex-col gap-1 text-sm text-slate-300 w-full">
      {label && <span className="text-xs font-medium text-slate-400">{label}</span>}
      <input
        {...props}
        className={`rounded-xl bg-slate-900 border border-slate-700 px-3 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 ${props.className ?? ''}`}
      />
    </label>
  )
}

export function Select({
  label,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  return (
    <label className="flex flex-col gap-1 text-sm text-slate-300 w-full">
      {label && <span className="text-xs font-medium text-slate-400">{label}</span>}
      <select
        {...props}
        className={`rounded-xl bg-slate-900 border border-slate-700 px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500 ${props.className ?? ''}`}
      >
        {children}
      </select>
    </label>
  )
}

export function EmptyState({ text }: { text: string }) {
  return <div className="text-center text-sm text-slate-500 py-8">{text}</div>
}
