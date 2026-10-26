import { AdditiveBlending, Color, ShaderMaterial } from 'three'
import { SIGNAL } from '../palette'

/**
 * Thin signal linework that "draws in": each vertex carries an aProgress
 * attribute (0 → 1 along its line) and fragments beyond uDraw are discarded.
 */
export function createDrawLineMaterial(opacity: number) {
  return new ShaderMaterial({
    uniforms: {
      uColor: { value: new Color(SIGNAL) },
      uOpacity: { value: opacity },
      uDraw: { value: 0 },
    },
    vertexShader: /* glsl */ `
      attribute float aProgress;
      varying float vProgress;
      void main() {
        vProgress = aProgress;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uOpacity;
      uniform float uDraw;
      varying float vProgress;
      void main() {
        if (vProgress > uDraw) discard;
        float head = smoothstep(uDraw - 0.05, uDraw, vProgress) * (1.0 - step(0.999, uDraw));
        gl_FragColor = vec4(uColor, uOpacity * (1.0 + head * 3.0));
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  })
}

/** Soft round points that resolve in random order as uDraw rises. */
export function createPointCloudMaterial(size: number, opacity: number) {
  return new ShaderMaterial({
    uniforms: {
      uColor: { value: new Color(SIGNAL) },
      uOpacity: { value: opacity },
      uDraw: { value: 0 },
      uSize: { value: size },
      uPixelRatio: { value: 1 },
    },
    vertexShader: /* glsl */ `
      attribute float aSeed;
      uniform float uSize;
      uniform float uDraw;
      uniform float uPixelRatio;
      varying float vAlpha;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = uSize * uPixelRatio * (6.0 / -mv.z);
        vAlpha = smoothstep(aSeed, aSeed + 0.08, uDraw);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uOpacity;
      varying float vAlpha;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        gl_FragColor = vec4(uColor, uOpacity * vAlpha * smoothstep(0.5, 0.0, d));
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  })
}

/** Glowing corridor tube: draws along uv.x, then a pulse travels its length. */
export function createCorridorMaterial(intensity: number) {
  return new ShaderMaterial({
    uniforms: {
      uColor: { value: new Color(SIGNAL) },
      uProgress: { value: 0 },
      uOpacity: { value: 1 },
      uIntensity: { value: intensity },
      uTime: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uProgress;
      uniform float uOpacity;
      uniform float uIntensity;
      uniform float uTime;
      varying vec2 vUv;
      void main() {
        if (vUv.x > uProgress) discard;
        float drawn = step(0.999, uProgress);
        float head = smoothstep(uProgress - 0.06, uProgress, vUv.x) * (1.0 - drawn);
        float pulse = exp(-pow((vUv.x - fract(uTime * 0.18)) * 14.0, 2.0)) * drawn;
        gl_FragColor = vec4(uColor, uOpacity * uIntensity * (0.55 + head * 2.5 + pulse * 1.6));
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  })
}
