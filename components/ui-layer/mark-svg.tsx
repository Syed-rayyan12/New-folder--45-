import type { MarkSpec } from '@/lib/mark'

/**
 * A static, orthographic SVG projection of a mark. Used for the archive and
 * for the non-WebGL fallback, so both share the exact same geometry.
 */
export function MarkSvg({
  spec,
  className,
  includeJourney = true,
  title,
}: {
  spec: MarkSpec
  className?: string
  includeJourney?: boolean
  title?: string
}) {
  const yaw = 0.6
  const pitch = 0.42
  const cy = Math.cos(yaw)
  const sy = Math.sin(yaw)
  const cp = Math.cos(pitch)
  const sp = Math.sin(pitch)
  const project = ([x, y, z]: [number, number, number]) => {
    const x1 = x * cy + z * sy
    const z1 = -x * sy + z * cy
    const y1 = y * cp - z1 * sp
    return [x1 * 50, -y1 * 50] as const
  }

  const layers = spec.layers.filter((layer) => includeJourney || layer.name !== 'journey')

  return (
    <svg viewBox="-110 -110 220 220" className={className} role={title ? 'img' : undefined} aria-hidden={title ? undefined : true}>
      {title && <title>{title}</title>}
      {layers.map((layer) => {
        let d = ''
        for (let i = 0; i < layer.segments.length; i += 2) {
          const [ax, ay] = project(layer.segments[i])
          const [bx, by] = project(layer.segments[i + 1])
          d += `M${ax.toFixed(1)} ${ay.toFixed(1)}L${bx.toFixed(1)} ${by.toFixed(1)}`
        }
        return (
          <path
            key={layer.name}
            d={d}
            fill="none"
            stroke="currentColor"
            strokeOpacity={layer.opacity}
            strokeWidth={layer.lineWidth * 0.6}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        )
      })}
    </svg>
  )
}
