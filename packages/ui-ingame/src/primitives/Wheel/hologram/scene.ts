import {
  AdditiveBlending,
  AlwaysDepth,
  Box3,
  CubeTextureLoader,
  DoubleSide,
  Group,
  LessEqualDepth,
  LinearSRGBColorSpace,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  RepeatWrapping,
  Scene,
  ShaderMaterial,
  Sphere,
  TextureLoader,
  WebGLRenderer,
  type Object3D,
  type Texture,
} from "three";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import { PostProcess } from "./post";

const { useWorkers: startDecoders } = MeshoptDecoder;
startDecoders(1);

const gridTexture = new URL("./grid.png", import.meta.url).href;
const gridMask = new URL("./whiteglobe.png", import.meta.url).href;
/** EVE's `fitting_cube.dds`, sRGB-encoded as EVE's `background.fx` writes it. */
const nebula = [
  new URL("./nebula-px.webp", import.meta.url).href,
  new URL("./nebula-nx.webp", import.meta.url).href,
  new URL("./nebula-py.webp", import.meta.url).href,
  new URL("./nebula-ny.webp", import.meta.url).href,
  new URL("./nebula-pz.webp", import.meta.url).href,
  new URL("./nebula-nz.webp", import.meta.url).href,
];

/** EVE's fitting camera: a field of view of 1 radian, turning 0.02 radian per pixel dragged, zooming a thousandth of its range per pixel scrolled. */
const fov = 1;
const orbitSpeed = 0.02;
const zoomSpeed = 0.001;
const maxPitch = 1.4;

/** EVE's `ScanGrid.red`: 100 by 100 cells over a plane of 15619 metres. */
const gridSize = 15619;
const gridCells = 100;

/** EVE's `FxISISHologramV3.fx`: every layer of the ship faintly, and its nearest surface lit where, bent by its normal map, it turns away from the camera. */
function ghostPasses(normalMap: Texture): [ShaderMaterial, ShaderMaterial] {
  const colour = [0.051, 0.051, 0.051];
  const layers = new ShaderMaterial({
    uniforms: { colour: { value: colour } },
    vertexShader: /* glsl */ `
      void main() {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 colour;
      void main() {
        gl_FragColor = vec4(colour, 1.0);
      }
    `,
    blending: AdditiveBlending,
    depthFunc: AlwaysDepth,
    depthWrite: false,
    side: DoubleSide,
  });
  const rim = new ShaderMaterial({
    uniforms: {
      fresnel: { value: [1.25, 22, 0] },
      colour: { value: colour },
      normalMap: { value: normalMap },
    },
    vertexShader: /* glsl */ `
      attribute vec4 tangent;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vTangent;
      varying vec3 vBinormal;
      varying vec3 vView;
      void main() {
        vec4 view = modelViewMatrix * vec4(position, 1.0);
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vTangent = normalize(mat3(modelViewMatrix) * tangent.xyz);
        vBinormal = cross(vNormal, vTangent) * tangent.w;
        vView = -view.xyz;
        gl_Position = projectionMatrix * view;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 fresnel;
      uniform vec3 colour;
      uniform sampler2D normalMap;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vTangent;
      varying vec3 vBinormal;
      varying vec3 vView;
      void main() {
        vec2 bump = (texture2D(normalMap, vUv).xy + 0.002) * 2.0 - 1.0;
        vec3 normal = normalize(vNormal + bump.x * vTangent + bump.y * vBinormal);
        float facing = clamp(dot(normalize(vView), normal) - fresnel.z, 0.0, 1.0);
        gl_FragColor = vec4(colour * pow(1.0 - facing, fresnel.x) * fresnel.y, 1.0);
      }
    `,
    blending: AdditiveBlending,
    depthFunc: LessEqualDepth,
    depthWrite: false,
    side: DoubleSide,
  });
  return [layers, rim];
}

const depthOnly = new MeshBasicMaterial({ colorWrite: false });

/** EVE's `ScanGrid.red` through `Ubershader.fx`: seen from above, its fresnel is always its full 3.5. */
function gridMaterial(lines: Texture, mask: Texture): ShaderMaterial {
  return new ShaderMaterial({
    uniforms: {
      cells: { value: gridCells },
      colour: { value: [0.298, 0.357, 0.447] },
      lines: { value: lines },
      mask: { value: mask },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float cells;
      uniform vec3 colour;
      uniform sampler2D lines;
      uniform sampler2D mask;
      varying vec2 vUv;
      void main() {
        float line = texture2D(lines, vUv * cells + 0.5).r;
        float fade = texture2D(mask, vUv).r;
        gl_FragColor = vec4(colour * line * fade * 3.5, 1.0);
      }
    `,
    blending: AdditiveBlending,
    depthWrite: false,
    side: DoubleSide,
  });
}

export interface Hull {
  /** URL of the glTF model. */
  model: string;
  /** URL of the normal map, with the X and Y of EVE's in red and green. */
  normalMap: string;
}

/** Draws the ghost of `hull` on `canvas`, turned by dragging it; returns a function to stop. */
export function showHologram(canvas: HTMLCanvasElement, hull: Hull): () => void {
  const renderer = new WebGLRenderer({ canvas });
  renderer.setPixelRatio(devicePixelRatio);
  renderer.outputColorSpace = LinearSRGBColorSpace;
  const post = new PostProcess(renderer);

  const scene = new Scene();
  const camera = new PerspectiveCamera((fov * 180) / Math.PI, 1, 1, 400000);
  const orbit = { yaw: 1.2 * Math.PI, pitch: 0.3, zoom: 0, near: 0, far: 1000 };

  let frame = 0;
  const render = () => {
    frame ||= requestAnimationFrame(() => {
      frame = 0;
      const { yaw, pitch, zoom, near, far } = orbit;
      const distance = near + (far - near) * zoom;
      camera.position.set(
        Math.sin(yaw) * Math.cos(pitch) * distance,
        Math.sin(pitch) * distance,
        Math.cos(yaw) * Math.cos(pitch) * distance,
      );
      camera.lookAt(0, 0, 0);
      post.render(scene, camera);
    });
  };

  const anisotropy = renderer.capabilities.getMaxAnisotropy();
  const load = (url: string) => {
    const texture = new TextureLoader().load(url, render);
    texture.anisotropy = anisotropy;
    return texture;
  };

  scene.background = new CubeTextureLoader().load(nebula, render);

  const lines = load(gridTexture);
  lines.wrapS = lines.wrapT = RepeatWrapping;
  const mask = load(gridMask);
  const normalMap = load(hull.normalMap);
  normalMap.wrapS = normalMap.wrapT = RepeatWrapping;
  normalMap.flipY = false;

  let disposed = false;
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  void loader.loadAsync(hull.model).then(({ scene: ship }) => {
    if (disposed) return;
    const bounds = new Box3().setFromObject(ship).getBoundingSphere(new Sphere());
    ship.position.sub(bounds.center);
    scene.add(ghostOf(ship, ghostPasses(normalMap)), floor(-bounds.radius / 2, gridMaterial(lines, mask)));
    // EVE's zoom: from touching the ship to twice as far as it fits in view; starting at twice touching it.
    const radius = bounds.radius + bounds.center.length();
    orbit.near = radius + camera.near;
    orbit.far = (2 * radius) / Math.tan(fov / 2);
    orbit.zoom = orbit.near / (orbit.far - orbit.near);
    render();
  });

  const resize = new ResizeObserver(() => {
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    post.setSize(canvas.width, canvas.height);
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    render();
  });
  resize.observe(canvas);

  const grab = (event: PointerEvent) => canvas.setPointerCapture(event.pointerId);
  const drag = (event: PointerEvent) => {
    if (!canvas.hasPointerCapture(event.pointerId)) return;
    orbit.yaw -= event.movementX * orbitSpeed;
    orbit.pitch = Math.min(maxPitch, Math.max(-maxPitch, orbit.pitch + event.movementY * orbitSpeed));
    render();
  };
  const zoom = (event: WheelEvent) => {
    event.preventDefault();
    orbit.zoom = Math.min(1, Math.max(0, orbit.zoom + event.deltaY * zoomSpeed));
    render();
  };
  canvas.addEventListener("pointerdown", grab);
  canvas.addEventListener("pointermove", drag);
  canvas.addEventListener("wheel", zoom, { passive: false });

  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    resize.disconnect();
    canvas.removeEventListener("pointerdown", grab);
    canvas.removeEventListener("pointermove", drag);
    canvas.removeEventListener("wheel", zoom);
    post.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
  };
}

/** The ship's depth first, then its ghost's passes. */
function ghostOf(ship: Object3D, passes: ShaderMaterial[]): Object3D {
  const ghost = new Group().add(ship);
  passes.forEach((pass, index) => {
    const copy = ship.clone();
    copy.traverse((part) => {
      if (part instanceof Mesh) {
        part.material = pass;
        part.renderOrder = 2 + index;
      }
    });
    ghost.add(copy);
  });
  ship.traverse((part) => {
    if (part instanceof Mesh) part.material = depthOnly;
  });
  return ghost;
}

function floor(height: number, material: ShaderMaterial): Object3D {
  const plane = new Mesh(new PlaneGeometry(gridSize, gridSize), material);
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = height;
  plane.renderOrder = 1;
  return plane;
}
