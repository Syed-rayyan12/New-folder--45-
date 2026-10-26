import { BlendFunction, Effect } from 'postprocessing'
import { Color, Uniform, type WebGLRenderer, type WebGLRenderTarget } from 'three'
import { SIGNAL } from '../palette'

const fragmentShader = /* glsl */ `
  uniform vec3 uSignal;
  uniform float uTime;
  uniform float uGrain;
  uniform float uVignette;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    // Collapse every pixel to a single intensity so only black → signal survives.
    float intensity = max(inputColor.r, max(inputColor.g, inputColor.b));
    float vignette = 1.0 - smoothstep(0.35, 0.95, distance(uv, vec2(0.5)) * uVignette);
    float grain = (hash(gl_FragCoord.xy + floor(uTime * 24.0) * 17.0) - 0.4) * uGrain;
    intensity = clamp(intensity * vignette + grain, 0.0, 1.0);
    outputColor = vec4(uSignal * intensity, inputColor.a);
  }
`

/**
 * Final pass that locks the frame to the two-colour palette and adds
 * monochrome green grain and a vignette derived from the same signal.
 */
export class PaletteEffect extends Effect {
  constructor({ grain = 0.05, vignette = 1.1 }: { grain?: number; vignette?: number } = {}) {
    super('PaletteEffect', fragmentShader, {
      blendFunction: BlendFunction.NORMAL,
      uniforms: new Map<string, Uniform>([
        ['uSignal', new Uniform(new Color(SIGNAL))],
        ['uTime', new Uniform(0)],
        ['uGrain', new Uniform(grain)],
        ['uVignette', new Uniform(vignette)],
      ]),
    })
  }

  override update(_renderer: WebGLRenderer, _inputBuffer: WebGLRenderTarget, deltaTime?: number) {
    const time = this.uniforms.get('uTime')
    if (time) time.value += deltaTime ?? 0.016
  }
}
