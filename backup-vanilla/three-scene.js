// WebGL and 3D Scene setup for Digital Flow
let scene, camera, renderer, blobMesh, materialShaderInstance;
let mouseX = 0, mouseY = 0;
let targetMouseX = 0, targetMouseY = 0;

// Dynamic check: Skip WebGL on mobile devices or if WebGL is unsupported
function shouldInit3D() {
  if (window.innerWidth < 768) return false;
  
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
}

// 3D Noise Shader Source (Simplex 3D Noise)
const noiseShaderChunk = `
  vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

  float snoise(vec3 v){
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 =   v - i + dot(i, C.xxx) ;

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );

    vec3 x1 = x0 - i1 + 1.0 * C.xxx;
    vec3 x2 = x0 - i2 + 2.0 * C.xxx;
    vec3 x3 = x0 - D.yyy;

    i = mod(i, 289.0 );
    vec4 p = permute( permute( permute(
               i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
             + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

    float n_ = 0.142857142857;
    vec3  ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                  dot(p2,x2), dot(p3,x3) ) );
  }
`;

function init3D() {
  const container = document.getElementById('canvas-container');
  if (!container) return;

  // Scene
  scene = new THREE.Scene();

  // Camera
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 8;

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  container.appendChild(renderer.domElement);

  // Generate a dynamic Environment map using a HTML canvas gradient
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(256, 256, 20, 256, 256, 240);
  grad.addColorStop(0, '#c7d2fe'); // Indigo-200
  grad.addColorStop(0.3, '#8b5cf6'); // Violet-500
  grad.addColorStop(0.7, '#4f46e5'); // Brand-600
  grad.addColorStop(1, '#ffffff');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  const envTexture = new THREE.CanvasTexture(canvas);
  envTexture.mapping = THREE.EquirectangularReflectionMapping;
  const envMap = pmremGenerator.fromEquirectangular(envTexture).texture;
  scene.environment = envMap;

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const pointLight1 = new THREE.PointLight(0x8b5cf6, 4, 15);
  pointLight1.position.set(4, 4, 4);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0x6366f1, 3, 15);
  pointLight2.position.set(-4, -4, 2);
  scene.add(pointLight2);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
  dirLight.position.set(0, 5, 5);
  scene.add(dirLight);

  // Geometry
  const geometry = new THREE.SphereGeometry(2.1, 96, 96);

  // Physical Glass Material (Highly realistic transmission and refraction)
  const material = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.05,
    roughness: 0.08,
    transmission: 1.0,
    ior: 1.48, // Index of refraction for glass
    thickness: 1.5,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    envMap: envMap,
    envMapIntensity: 1.5,
    transparent: true,
  });

  // Inject Custom Noise Shaders into MeshPhysicalMaterial
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = { value: 0 };
    shader.uniforms.uNoiseStrength = { value: 0.18 };
    shader.uniforms.uNoiseSpeed = { value: 0.25 };
    shader.uniforms.uNoiseFrequency = { value: 0.65 };

    materialShaderInstance = shader;

    // Inject Simplex Noise helpers
    shader.vertexShader = shader.vertexShader.replace(
      '#include <common>',
      `
      #include <common>
      uniform float uTime;
      uniform float uNoiseStrength;
      uniform float uNoiseSpeed;
      uniform float uNoiseFrequency;
      
      ${noiseShaderChunk}
      `
    );

    // Apply vertex offset based on normal displacement
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      float displacement = snoise(position * uNoiseFrequency + uTime * uNoiseSpeed) * uNoiseStrength;
      transformed += normal * displacement;
      `
    );
  };

  // Mesh
  blobMesh = new THREE.Mesh(geometry, material);
  scene.add(blobMesh);

  // Center positioning
  blobMesh.position.set(1.5, 0, 0); // Offset to the right slightly on desktop for hero layout

  // Event Listeners
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('resize', onWindowResize);

  // Trigger page load check
  checkShaderReady();
}

function onMouseMove(event) {
  // Normalize coordinates (-1 to 1)
  targetMouseX = (event.clientX / window.innerWidth) * 2 - 1;
  targetMouseY = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onWindowResize() {
  if (window.innerWidth < 768) {
    // Shutdown Three.js if user resizes window down to mobile size
    const container = document.getElementById('canvas-container');
    if (container) container.innerHTML = '';
    return;
  }
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

// Ensure the skeleton loader hides only after shaders compile
function checkShaderReady() {
  const checkInterval = setInterval(() => {
    if (materialShaderInstance || !shouldInit3D()) {
      clearInterval(checkInterval);
      // Wait another 400ms for texture bindings, then dispatch loaded event
      setTimeout(() => {
        window.dispatchEvent(new Event('threejs-loaded'));
      }, 400);
    }
  }, 100);
}

// Animation loop
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const elapsedTime = clock.getElapsedTime();

  if (materialShaderInstance) {
    materialShaderInstance.uniforms.uTime.value = elapsedTime;
  }

  if (blobMesh) {
    // Subtle auto-rotation
    blobMesh.rotation.y = elapsedTime * 0.08;
    blobMesh.rotation.x = elapsedTime * 0.05;

    // Follow cursor with lag (interpolation)
    mouseX += (targetMouseX - mouseX) * 0.08;
    mouseY += (targetMouseY - mouseY) * 0.08;

    // Displace blob position slightly based on mouse
    blobMesh.position.x = 1.5 + mouseX * 0.4;
    blobMesh.position.y = mouseY * 0.4;
    
    // Rotate blob orientation slightly towards mouse
    blobMesh.rotation.z = mouseX * 0.15;
  }

  renderer.render(scene, camera);
}

// Initialization Entrypoint
document.addEventListener('DOMContentLoaded', () => {
  if (shouldInit3D()) {
    init3D();
    animate();
    
    // Bind Scroll Animation with GSAP
    if (window.gsap) {
      gsap.to(camera.position, {
        scrollTrigger: {
          trigger: "#playground",
          start: "top bottom",
          end: "top top",
          scrub: 1,
        },
        z: 14, // Scale down by moving camera back
        y: -3,  // Scroll down effect
      });
    }
  } else {
    // Force dispatch loader event if WebGL is skipped
    setTimeout(() => {
      window.dispatchEvent(new Event('threejs-loaded'));
    }, 500);
  }
});
