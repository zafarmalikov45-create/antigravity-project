'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/* ── Simplex 3D noise (GLSL) ── */
const NOISE_GLSL = `
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x,289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);
  const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.0-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+2.0*C.xxx;
  vec3 x3=x0-D.yyy;
  i=mod(i,289.0);
  vec4 p=permute(permute(permute(
    i.z+vec4(0.0,i1.z,i2.z,1.0))
    +i.y+vec4(0.0,i1.y,i2.y,1.0))
    +i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;
  vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
`;

function shouldInit3D() {
  if (typeof window === 'undefined') return false;
  if (window.innerWidth < 768) return false;
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
  } catch { return false; }
}

export default function GlassBlob() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!shouldInit3D() || !containerRef.current) {
      window.dispatchEvent(new Event('threejs-loaded'));
      return;
    }

    const container = containerRef.current;

    /* Scene */
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.appendChild(renderer.domElement);

    /* Env map */
    const pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();

    const cvs = document.createElement('canvas');
    cvs.width = 512; cvs.height = 512;
    const ctx = cvs.getContext('2d')!;
    const grad = ctx.createRadialGradient(256, 256, 20, 256, 256, 240);
    grad.addColorStop(0, '#c7d2fe');
    grad.addColorStop(0.3, '#8b5cf6');
    grad.addColorStop(0.7, '#4f46e5');
    grad.addColorStop(1, '#ffffff');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    const envTex = new THREE.CanvasTexture(cvs);
    envTex.mapping = THREE.EquirectangularReflectionMapping;
    const envMap = pmrem.fromEquirectangular(envTex).texture;
    scene.environment = envMap;

    /* Lights */
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const p1 = new THREE.PointLight(0x8b5cf6, 4, 15); p1.position.set(4, 4, 4); scene.add(p1);
    const p2 = new THREE.PointLight(0x6366f1, 3, 15); p2.position.set(-4, -4, 2); scene.add(p2);
    const dl = new THREE.DirectionalLight(0xffffff, 1.5); dl.position.set(0, 5, 5); scene.add(dl);

    /* Material */
    let shaderRef: { uniforms: Record<string, { value: number }> } | null = null;

    const material = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.05,
      roughness: 0.08,
      transmission: 1.0,
      ior: 1.48,
      thickness: 1.5,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      envMap,
      envMapIntensity: 1.5,
      transparent: true,
    });

    material.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = { value: 0 };
      shader.uniforms.uNoiseStrength = { value: 0.18 };
      shader.uniforms.uNoiseSpeed = { value: 0.25 };
      shader.uniforms.uNoiseFrequency = { value: 0.65 };
      shaderRef = shader as typeof shaderRef;

      shader.vertexShader = shader.vertexShader.replace(
        '#include <common>',
        `#include <common>
        uniform float uTime;
        uniform float uNoiseStrength;
        uniform float uNoiseSpeed;
        uniform float uNoiseFrequency;
        ${NOISE_GLSL}`,
      );

      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        float displacement = snoise(position * uNoiseFrequency + uTime * uNoiseSpeed) * uNoiseStrength;
        transformed += normal * displacement;`,
      );
    };

    /* Mesh */
    const geo = new THREE.SphereGeometry(2.1, 96, 96);
    const blob = new THREE.Mesh(geo, material);
    blob.position.set(1.5, 0, 0);
    scene.add(blob);

    /* Mouse tracking */
    let mouseX = 0, mouseY = 0, tMouseX = 0, tMouseY = 0;
    const onMouse = (e: MouseEvent) => {
      tMouseX = (e.clientX / window.innerWidth) * 2 - 1;
      tMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', onMouse);

    /* Resize */
    const onResize = () => {
      if (window.innerWidth < 768) { container.innerHTML = ''; return; }
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    /* Shader ready check */
    const readyInterval = setInterval(() => {
      if (shaderRef) {
        clearInterval(readyInterval);
        setTimeout(() => window.dispatchEvent(new Event('threejs-loaded')), 400);
      }
    }, 100);

    /* Animate */
    const clock = new THREE.Clock();
    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      if (shaderRef) shaderRef.uniforms.uTime.value = t;
      blob.rotation.y = t * 0.08;
      blob.rotation.x = t * 0.05;
      mouseX += (tMouseX - mouseX) * 0.08;
      mouseY += (tMouseY - mouseY) * 0.08;
      blob.position.x = 1.5 + mouseX * 0.4;
      blob.position.y = mouseY * 0.4;
      blob.rotation.z = mouseX * 0.15;
      renderer.render(scene, camera);
    };
    animate();

    /* Cleanup */
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(readyInterval);
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      geo.dispose();
      material.dispose();
      envTex.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={containerRef} id="canvas-container" />;
}
