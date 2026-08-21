export function ProgressRing({
  value,
  total,
  size = 44,
  stroke = 3.5,
  showLabel = true,
}: {
  value: number
  total: number
  size?: number
  stroke?: number
  showLabel?: boolean
}) {
  const pct = total > 0 ? Math.min(1, value / total) : 0
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const complete = pct >= 1

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="rgb(var(--line))" strokeWidth={stroke}
        />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke={complete ? 'rgb(var(--teal))' : 'rgb(var(--accent))'}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          style={{ transition: 'stroke-dashoffset .6s cubic-bezier(.2,.8,.2,1)' }}
        />
      </svg>
      {showLabel && (
        <span
          className="absolute inset-0 grid place-items-center font-mono tabular-nums"
          style={{ fontSize: size < 40 ? 9 : 10.5 }}
        >
          {Math.round(pct * 100)}
        </span>
      )}
    </div>
  )
}
