import {
  AdditiveBlending,
  Box3,
  CubeTextureLoader,
  DoubleSide,
  Group,
  LessEqualDepth,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  RepeatWrapping,
  Scene,
  ShaderMaterial,
  Sphere,
  SRGBColorSpace,
  TextureLoader,
  WebGLRenderer,
  type Object3D,
  type Texture,
} from "three";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const gridTexture = new URL("./grid.png", import.meta.url).href;
const nebula = [
  new URL("./nebula-px.webp", import.meta.url).href,
  new URL("./nebula-nx.webp", import.meta.url).href,
  new URL("./nebula-py.webp", import.meta.url).href,
  new URL("./nebula-ny.webp", import.meta.url).href,
  new URL("./nebula-pz.webp", import.meta.url).href,
  new URL("./nebula-nz.webp", import.meta.url).href,
];

/** EVE's fitting camera: a field of view of 1 radian, turning 0.02 radian per pixel dragged. */
const fov = (1 * 180) / Math.PI;
const orbitSpeed = 0.02;
const maxPitch = 1.4;

/** EVE's `ScanGrid.red`: 100 by 100 cells over a plane of 15619 metres. */
const gridSize = 15619;
const gridCells = 100;

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vec4 view = modelViewMatrix * vec4(position, 1.0);
    vUv = uv;
    vNormal = normalMatrix * normal;
    vView = -view.xyz;
    gl_Position = projectionMatrix * view;
  }
`;

/** EVE's `FxISISHologramV3.fx`: an additive rim, lit where the surface turns away from the camera. */
const ghost = new ShaderMaterial({
  uniforms: {
    fresnel: { value: [1.25, 22, 0] },
    colour: { value: [0.051, 0.051, 0.051] },
  },
  vertexShader,
  fragmentShader: /* glsl */ `
    uniform vec3 fresnel;
    uniform vec3 colour;
    varying vec3 vNormal;
    varying vec3 vView;
    void main() {
      float facing = clamp(dot(normalize(vView), normalize(vNormal)) - fresnel.z, 0.0, 1.0);
      gl_FragColor = vec4(colour * pow(1.0 - facing, fresnel.x) * fresnel.y, 1.0);
    }
  `,
  blending: AdditiveBlending,
  depthFunc: LessEqualDepth,
  depthWrite: false,
});

const depthOnly = new MeshBasicMaterial({ colorWrite: false });

/** EVE's `ScanGrid.red`: grid lines that fade out away from the ship, and brighten when seen from the side. */
function gridMaterial(lines: Texture): ShaderMaterial {
  return new ShaderMaterial({
    uniforms: {
      cells: { value: gridCells },
      colour: { value: [0.298, 0.357, 0.447] },
      lines: { value: lines },
    },
    vertexShader,
    fragmentShader: /* glsl */ `
      uniform float cells;
      uniform vec3 colour;
      uniform sampler2D lines;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        float luminance = texture2D(lines, vUv * cells).r;
        float side = pow(1.0 - abs(dot(normalize(vView), normalize(vNormal))), 2.0) * 3.5;
        float fade = 0.9 * (1.0 - smoothstep(0.0, 0.5, length(vUv - 0.5)));
        gl_FragColor = vec4(colour * luminance * max(side, 1.0) * fade, 1.0);
      }
    `,
    blending: AdditiveBlending,
    depthWrite: false,
    side: DoubleSide,
  });
}

/** Draws the ghost of `model` on `canvas`, turned by dragging it; returns a function to stop. */
export function showHologram(canvas: HTMLCanvasElement, model: string): () => void {
  const renderer = new WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(devicePixelRatio);

  const scene = new Scene();
  const camera = new PerspectiveCamera(fov, 1, 1, 400000);
  const orbit = { yaw: 1.2 * Math.PI, pitch: 0.3, distance: 1000 };

  let frame = 0;
  const render = () => {
    frame ||= requestAnimationFrame(() => {
      frame = 0;
      const { yaw, pitch, distance } = orbit;
      camera.position.set(
        Math.sin(yaw) * Math.cos(pitch) * distance,
        Math.sin(pitch) * distance,
        Math.cos(yaw) * Math.cos(pitch) * distance,
      );
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    });
  };

  scene.background = new CubeTextureLoader().load(nebula, render);
  scene.background.colorSpace = SRGBColorSpace;

  const lines = new TextureLoader().load(gridTexture, render);
  lines.wrapS = lines.wrapT = RepeatWrapping;
  lines.anisotropy = renderer.capabilities.getMaxAnisotropy();

  let disposed = false;
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  void loader.loadAsync(model).then(({ scene: ship }) => {
    if (disposed) return;
    const bounds = new Box3().setFromObject(ship).getBoundingSphere(new Sphere());
    ship.position.sub(bounds.center);
    scene.add(ghostOf(ship), floor(-bounds.radius / 2, lines));
    // EVE's default zoom: twice the distance at which the camera touches the ship.
    orbit.distance = 2 * (bounds.radius + bounds.center.length() + camera.near);
    render();
  });

  const resize = new ResizeObserver(() => {
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
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
  canvas.addEventListener("pointerdown", grab);
  canvas.addEventListener("pointermove", drag);

  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    resize.disconnect();
    canvas.removeEventListener("pointerdown", grab);
    canvas.removeEventListener("pointermove", drag);
    renderer.dispose();
    renderer.forceContextLoss();
  };
}

/** The ship's depth, then its ghost over only the surface nearest to the camera. */
function ghostOf(ship: Object3D): Object3D {
  const glow = ship.clone();
  ship.traverse((part) => {
    if (part instanceof Mesh) part.material = depthOnly;
  });
  glow.traverse((part) => {
    if (part instanceof Mesh) {
      part.material = ghost;
      part.renderOrder = 2;
    }
  });
  return new Group().add(ship, glow);
}

function floor(height: number, lines: Texture): Object3D {
  const plane = new Mesh(new PlaneGeometry(gridSize, gridSize), gridMaterial(lines));
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = height;
  plane.renderOrder = 1;
  return plane;
}
