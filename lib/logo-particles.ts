/** Deterministic stippling of the actual PRVLG + HERITAGE silhouette. */
export type LogoParticle = { x: number; y: number; radius: number; rank: number; phase: number }

export function logoParticles(pixels: Uint8ClampedArray | Uint8Array, width: number, height: number, count = 14000): LogoParticle[] {
  let seed = 78123
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296 }
  const alpha = (x: number, y: number) => x < 0 || y < 0 || x >= width || y >= height ? 0 : pixels[(Math.floor(y) * width + Math.floor(x)) * 4 + 3]
  const particles: LogoParticle[] = []
  for (let attempt = 0; particles.length < count && attempt < count * 40; attempt++) {
    const x = random() * width, y = random() * height
    if (alpha(x, y) < 200) continue
    const edge = Math.min(alpha(x - 3, y), alpha(x + 3, y), alpha(x, y - 3), alpha(x, y + 3)) < 180
    particles.push({ x: x / width * 330, y: y / height * 194, radius: 0.18 + random() * 0.5, rank: Math.pow(random(), edge ? 2.4 : 0.72), phase: random() * Math.PI * 2 })
  }
  return particles
}

export const LOGO_STEPS = [0.045, 0.22, 0.48, 1] as const
export const LOGO_STAGE_ENDS = [1.3, 2.6, 4.0, 5.8] as const
export const LOGO_FORMATION_DURATION = LOGO_STAGE_ENDS[3]
export const LOGO_PARTICLE_TRAVEL = 1.15
export const LOGO_COMPLETE_AT = 6.65

/** One continuous monotone curve: reference steps do not pause the movement. */
function noiseCurve(seconds:number,values:readonly number[]) {
  const times=[0,...LOGO_STAGE_ENDS]
  if(seconds<=0)return values[0]
  if(seconds>=LOGO_FORMATION_DURATION)return values[values.length-1]
  let i=0
  while(seconds>times[i+1])i++
  const tangent=(k:number)=>{
    if(k===0||k===values.length-1)return 0
    const left=(values[k]-values[k-1])/(times[k]-times[k-1])
    const right=(values[k+1]-values[k])/(times[k+1]-times[k])
    return left*right<=0?0:2*left*right/(left+right)
  }
  const duration=times[i+1]-times[i],t=(seconds-times[i])/duration,t2=t*t,t3=t2*t
  return (2*t3-3*t2+1)*values[i]+(t3-2*t2+t)*duration*tangent(i)
    +(-2*t3+3*t2)*values[i+1]+(t3-t2)*duration*tangent(i+1)
}

/** Faint grain builds continuously into the same permanent black-and-white finish. */
export function logoNoiseFrame(seconds:number) {
  return {
    threshold:noiseCurve(seconds,[0.76,0.64,0.55,0.48,0.41]),
    opacity:noiseCurve(seconds,[0,0.18,0.38,0.62,1]),
  }
}

/** Grain flows within the letters, then freezes on the fourth reference texture. */
export function logoNoiseMotion(seconds:number) {
  const t=Math.max(0,Math.min(1,seconds/LOGO_FORMATION_DURATION))
  const remaining=(1-t)*(1-t)
  return {
    x:Math.sin(seconds*1.25)*2.4*remaining,
    y:8*remaining,
    sheenY:-80+t*350,
    sheenOpacity:Math.sin(Math.PI*t)*0.3,
  }
}

/** The sparse silhouette must finish before the denser reference stages form. */
export function logoParticleArrival(rank: number) {
  const end = rank <= LOGO_STEPS[0] ? 0.25 + rank / LOGO_STEPS[0] * 1.05
    : rank <= LOGO_STEPS[1] ? 1.3 + (rank - LOGO_STEPS[0]) / (LOGO_STEPS[1] - LOGO_STEPS[0]) * 1.3
    : rank <= LOGO_STEPS[2] ? 2.6 + (rank - LOGO_STEPS[1]) / (LOGO_STEPS[2] - LOGO_STEPS[1]) * 1.4
    : 4.0 + (rank - LOGO_STEPS[2]) / (1 - LOGO_STEPS[2]) * 1.8
  return end - LOGO_PARTICLE_TRAVEL
}

/** Each star travels into its own place instead of appearing through a mask. */
export function logoParticleMotion(p: LogoParticle, seconds: number) {
  const arrival = logoParticleArrival(p.rank)
  const progress = Math.max(0, Math.min(1, (seconds - arrival) / LOGO_PARTICLE_TRAVEL))
  const eased = progress ** 3 * (progress * (progress * 6 - 15) + 10)
  const remaining = 1 - eased
  const distance = 7 + p.rank * 17
  return {
    x: p.x + Math.cos(p.phase) * distance * remaining,
    y: p.y + Math.sin(p.phase) * distance * remaining,
    progress,
  }
}

export function logoDensity(seconds: number) {
  let fromTime = 0, fromDensity = 0
  for (let i = 0; i < LOGO_STAGE_ENDS.length; i++) {
    if (seconds <= LOGO_STAGE_ENDS[i]) {
      const t = Math.max(0, (seconds - fromTime) / (LOGO_STAGE_ENDS[i] - fromTime))
      return fromDensity + (LOGO_STEPS[i] - fromDensity) * t
    }
    fromTime = LOGO_STAGE_ENDS[i]
    fromDensity = LOGO_STEPS[i]
  }
  return 1
}
