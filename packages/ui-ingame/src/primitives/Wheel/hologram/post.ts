import {
  HalfFloatType,
  LinearFilter,
  Mesh,
  NearestFilter,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderTarget,
  type Camera,
  type Texture,
  type WebGLRenderer,
} from "three";

/** EVE's bloom (`res:/dx9/default/postprocess.black`): six levels, each half the one before. */
const bloom = [
  { step: 0.3, tint: 0.3465 },
  { step: 1, tint: 0.138 },
  { step: 2, tint: 0.1176 },
  { step: 10, tint: 0.066 },
  { step: 30, tint: 0.066 },
  { step: 64, tint: 0.061 },
];
const bloomBrightness = 0.2;

/** EVE's dynamic exposure: a histogram of 64 bins between these luminances. */
const minLuminance = 0.4649;
const maxLuminance = 10;
const middleValue = 0.55;
const measureSize = 128;

const srgb = /* glsl */ `
  vec3 srgbToLinear(vec3 c) {
    return mix(c / 12.92, pow((max(c, 0.0) + 0.055) / 1.055, vec3(2.4)), step(0.04045, c));
  }
  vec3 linearToSrgb(vec3 c) {
    return mix(c * 12.92, 1.055 * pow(max(c, 0.0), vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
  }
`;

type Pass<U> = ShaderMaterial & { uniforms: U };

function pass<U extends Record<string, { value: unknown }>>(fragmentShader: string, uniforms: U): Pass<U> {
  return new ShaderMaterial({
    uniforms,
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `,
    fragmentShader,
    depthTest: false,
    depthWrite: false,
  }) as Pass<U>;
}

const sampler = () => ({ value: null as Texture | null });

/** The first step down: five averages weighted by luminance, summed as EVE does. */
const firstDown = pass(
  /* glsl */ `
    uniform sampler2D source;
    uniform vec2 texel;
    varying vec2 vUv;
    vec4 tap(vec2 offset) {
      vec3 c = texture2D(source, vUv + offset * texel).rgb;
      float w = max(dot(c, vec3(0.299, 0.587, 0.114)), 0.0);
      return vec4(c * w, w);
    }
    vec3 average(vec4 a, vec4 b, vec4 c, vec4 d) {
      vec4 sum = a + b + c + d;
      return sum.w > 0.0 ? sum.rgb / sum.w : vec3(0.0);
    }
    void main() {
      vec4 m = tap(vec2(0, 0));
      gl_FragColor = vec4(
        average(tap(vec2(-1, -1)), tap(vec2(1, -1)), tap(vec2(-1, 1)), tap(vec2(1, 1))) +
        average(tap(vec2(-2, -2)), tap(vec2(0, -2)), tap(vec2(-2, 0)), m) +
        average(tap(vec2(0, -2)), tap(vec2(2, -2)), m, tap(vec2(2, 0))) +
        average(tap(vec2(-2, 0)), m, tap(vec2(-2, 2)), tap(vec2(0, 2))) +
        average(m, tap(vec2(2, 0)), tap(vec2(0, 2)), tap(vec2(2, 2))),
        1.0
      );
    }
  `,
  { source: sampler(), texel: { value: new Vector2() } },
);

const down = pass(
  /* glsl */ `
    uniform sampler2D source;
    uniform vec2 texel;
    varying vec2 vUv;
    vec3 tap(vec2 offset) {
      return texture2D(source, vUv + offset * texel).rgb;
    }
    void main() {
      vec3 inner = tap(vec2(-1, -1)) + tap(vec2(1, -1)) + tap(vec2(-1, 1)) + tap(vec2(1, 1));
      vec3 m = tap(vec2(0, 0));
      vec3 corners =
        tap(vec2(-2, -2)) + tap(vec2(0, -2)) + tap(vec2(-2, 0)) + m +
        tap(vec2(0, -2)) + tap(vec2(2, -2)) + m + tap(vec2(2, 0)) +
        tap(vec2(-2, 0)) + m + tap(vec2(-2, 2)) + tap(vec2(0, 2)) +
        m + tap(vec2(2, 0)) + tap(vec2(0, 2)) + tap(vec2(2, 2));
      gl_FragColor = vec4(inner * 0.125 + corners * 0.03125, 1.0);
    }
  `,
  { source: sampler(), texel: { value: new Vector2() } },
);

/** A Gaussian of EVE's shape, `exp(-5π(x/r)²)`, leaving out taps off the image. */
const blur = pass(
  /* glsl */ `
    uniform sampler2D source;
    uniform vec2 texel;
    uniform vec2 direction;
    uniform float radius;
    varying vec2 vUv;
    void main() {
      vec3 sum = texture2D(source, vUv).rgb;
      float total = 1.0;
      for (int i = 1; i <= 127; i++) {
        float x = float(i);
        if (x > radius) break;
        float w = exp(-5.0 * 3.14159265 * (x / radius) * (x / radius));
        for (int side = -1; side <= 1; side += 2) {
          vec2 uv = vUv + float(side) * x * direction * texel;
          if (uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0) continue;
          sum += texture2D(source, uv).rgb * w;
          total += w;
        }
      }
      gl_FragColor = vec4(sum / total, 1.0);
    }
  `,
  { source: sampler(), texel: { value: new Vector2() }, direction: { value: new Vector2() }, radius: { value: 1 } },
);

const up = pass(
  /* glsl */ `
    uniform sampler2D source;
    uniform sampler2D below;
    uniform float tint;
    uniform bool hasBelow;
    varying vec2 vUv;
    void main() {
      vec3 c = texture2D(source, vUv).rgb * tint;
      if (hasBelow) c += texture2D(below, vUv).rgb;
      gl_FragColor = vec4(c, 1.0);
    }
  `,
  { source: sampler(), below: sampler(), tint: { value: 0 }, hasBelow: { value: false } },
);

/** Where each pixel falls between EVE's histogram bounds. */
const measure = pass(
  /* glsl */ `
    uniform sampler2D source;
    varying vec2 vUv;
    ${srgb}
    void main() {
      float y = dot(srgbToLinear(texture2D(source, vUv).rgb), vec3(0.2125, 0.7154, 0.0721));
      float low = log(${minLuminance});
      float high = log(${maxLuminance.toFixed(1)});
      gl_FragColor = vec4(clamp((log(max(y, 1e-6)) - low) / (high - low), 0.0, 1.0), 0.0, 0.0, 1.0);
    }
  `,
  { source: sampler() },
);

/** EVE's tonemapping: the buffer taken as sRGB, plus bloom, exposed, through Uncharted 2, and back to sRGB. */
const tonemap = pass(
  /* glsl */ `
    uniform sampler2D source;
    uniform sampler2D bloom;
    uniform float exposure;
    varying vec2 vUv;
    ${srgb}
    vec3 uncharted2(vec3 x) {
      const float A = 0.125, B = 0.25, C = 0.1, D = 0.15, E = 0.021, F = 0.3;
      return (x * (A * x + C * B) + D * E) / (x * (A * x + B) + D * F) - E / F;
    }
    void main() {
      float white = uncharted2(vec3(2.5)).x;
      vec3 c = srgbToLinear(texture2D(source, vUv).rgb);
      c += max(uncharted2(2.0 * texture2D(bloom, vUv).rgb), 0.0) / white;
      c = max(uncharted2(2.0 * c * exposure), 0.0) / white;
      float dither = fract(dot(gl_FragCoord.xy, vec2(0.754877627, 0.569840252))) / 255.0 - 0.5 / 255.0;
      gl_FragColor = vec4(linearToSrgb(c) + dither, 1.0);
    }
  `,
  { source: sampler(), bloom: sampler(), exposure: { value: 1 } },
);

const hdr = () => new WebGLRenderTarget(1, 1, { type: HalfFloatType, depthBuffer: false, minFilter: LinearFilter });

/** EVE's post-processing for the fitting window: dynamic exposure, bloom and tonemapping. */
export class PostProcess {
  private readonly scene = new Scene();
  private readonly camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private readonly quad = new Mesh(new PlaneGeometry(2, 2));
  private readonly buffer = new WebGLRenderTarget(1, 1, { type: HalfFloatType, samples: 4 });
  private readonly levels = bloom.map((level) => ({ ...level, image: hdr(), blurred: hdr(), sum: hdr() }));
  private readonly measured = new WebGLRenderTarget(measureSize, measureSize, {
    depthBuffer: false,
    minFilter: NearestFilter,
    magFilter: NearestFilter,
  });
  private readonly bins = new Uint8Array(measureSize * measureSize * 4);
  /** EVE's exposure for a dark scene, until the first measurement. */
  private exposure = middleValue / 0.486;
  private measuring = false;

  /** `changed` is called when the exposure has adjusted to what was rendered. */
  constructor(
    private readonly renderer: WebGLRenderer,
    private readonly changed: () => void,
  ) {
    this.scene.add(this.quad);
  }

  setSize(width: number, height: number) {
    this.buffer.setSize(width, height);
    this.levels.forEach(({ image, blurred, sum }, index) => {
      const w = Math.max(1, width >> (index + 1));
      const h = Math.max(1, height >> (index + 1));
      for (const target of [image, blurred, sum]) target.setSize(w, h);
    });
  }

  render(scene: Scene, camera: Camera) {
    this.renderer.setRenderTarget(this.buffer);
    this.renderer.render(scene, camera);

    let source = this.buffer;
    for (const { image } of this.levels) {
      const material = source === this.buffer ? firstDown : down;
      material.uniforms.source.value = source.texture;
      material.uniforms.texel.value.set(1 / source.width, 1 / source.height);
      this.draw(material, image);
      source = image;
    }

    let below: WebGLRenderTarget | undefined;
    for (const { step, tint, image, blurred, sum } of this.levels.toReversed()) {
      const radius = Math.min(127, Math.max(image.width, image.height) * 4 * step * 0.01);
      this.blur(image, blurred, radius, 1, 0);
      this.blur(blurred, image, radius, 0, 1);
      up.uniforms.source.value = image.texture;
      up.uniforms.tint.value = (tint * bloomBrightness) / bloom.length;
      up.uniforms.hasBelow.value = below !== undefined;
      up.uniforms.below.value = below?.texture ?? null;
      this.draw(up, sum);
      below = sum;
    }

    tonemap.uniforms.source.value = this.buffer.texture;
    tonemap.uniforms.bloom.value = below?.texture ?? null;
    tonemap.uniforms.exposure.value = this.exposure;
    this.draw(tonemap, null);
    this.measure();
  }

  dispose() {
    this.buffer.dispose();
    this.measured.dispose();
    for (const { image, blurred, sum } of this.levels) for (const target of [image, blurred, sum]) target.dispose();
    this.quad.geometry.dispose();
  }

  private draw(material: ShaderMaterial, target: WebGLRenderTarget | null) {
    this.quad.material = material;
    this.renderer.setRenderTarget(target);
    this.renderer.render(this.scene, this.camera);
  }

  private blur(from: WebGLRenderTarget, to: WebGLRenderTarget, radius: number, x: number, y: number) {
    blur.uniforms.source.value = from.texture;
    blur.uniforms.texel.value.set(1 / from.width, 1 / from.height);
    blur.uniforms.direction.value.set(x, y);
    blur.uniforms.radius.value = radius;
    this.draw(blur, to);
  }

  /** Adjusts to the multiplier EVE settles on: 0.55 over the average of the 90th and 98th percentile luminance. */
  private measure() {
    if (this.measuring) return;
    this.measuring = true;
    measure.uniforms.source.value = this.buffer.texture;
    this.draw(measure, this.measured);
    void this.renderer
      .readRenderTargetPixelsAsync(this.measured, 0, 0, measureSize, measureSize, this.bins)
      .then(() => {
        this.measuring = false;
        const exposure = middleValue / Math.min(0.5 / 2 ** -3.7, Math.max(0.5 / 2 ** 10, this.luminance()));
        if (Math.abs(exposure - this.exposure) < 0.01 * this.exposure) return;
        this.exposure = exposure;
        this.changed();
      })
      .catch(() => {
        this.measuring = false;
      });
  }

  private luminance(): number {
    const counts = Array.from({ length: 64 }, () => 0);
    for (let i = 0; i < this.bins.length; i += 4) counts[Math.min(63, Math.floor((this.bins[i]! / 255) * 64))]! += 1;
    const pixels = measureSize * measureSize;
    const percentile = (p: number) => {
      let seen = 0;
      for (const [bin, count] of counts.entries()) {
        if (count > 0 && seen + count >= p * pixels) {
          const at = (bin + (p * pixels - seen) / count) / 64;
          return Math.exp(Math.log(minLuminance) + at * (Math.log(maxLuminance) - Math.log(minLuminance)));
        }
        seen += count;
      }
      return maxLuminance;
    };
    return (percentile(0.9) + percentile(0.98)) / 2;
  }
}
