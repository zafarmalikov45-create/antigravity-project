'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/* ─────────────────────────── config ─────────────────────────── */
const N = 80;            // node count
const DIST = 2.1;        // max connection distance
const MAX_PULSES = 50;   // live data-pulse count
const PULSE_SPEED = 0.5; // world-units / second

/* ─────────────────────────── shaders ────────────────────────── */

// Glowing node – custom glow disk with per-node pulse phase
const nodeVert = /* glsl */`
  uniform float uTime;
  attribute float aPhase;
  attribute float aSize;
  varying  float vGlow;
  void main(){
    float p   = 0.6 + 0.4 * sin(uTime * 1.7 + aPhase);
    vGlow     = p;
    vec4 mv   = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * p * (340.0 / -mv.z);
    gl_Position  = projectionMatrix * mv;
  }
`;
const nodeFrag = /* glsl */`
  uniform vec3 uColorA;   // indigo
  uniform vec3 uColorB;   // violet
  varying float vGlow;
  void main(){
    vec2  d = gl_PointCoord - 0.5;
    float r = length(d);
    if(r > 0.5) discard;
    float core = 1.0 - smoothstep(0.0, 0.15, r);
    float halo = pow(max(0.0, 1.0 - r * 2.0), 2.6);
    vec3  col  = mix(uColorA, uColorB, vGlow);
    gl_FragColor = vec4(col, (halo + core * 0.4) * vGlow);
  }
`;

// Data pulse – bright white-violet dot riding along edges
const pulseVert = /* glsl */`
  attribute float aAlpha;
  varying  float vA;
  void main(){
    vA = aAlpha;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = 7.5 * (300.0 / -mv.z);
    gl_Position  = projectionMatrix * mv;
  }
`;
const pulseFrag = /* glsl */`
  varying float vA;
  void main(){
    float r = length(gl_PointCoord - 0.5);
    if(r > 0.5) discard;
    float g = pow(max(0.0, 1.0 - r * 2.0), 1.6);
    gl_FragColor = vec4(0.96, 0.94, 1.0, g * vA);
  }
`;

/* ─────────────────────────── helper ─────────────────────────── */
function canGL(): boolean {
  if (typeof window === 'undefined' || window.innerWidth < 768) return false;
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext &&
      (c.getContext('webgl') || c.getContext('experimental-webgl')));
  } catch { return false; }
}

/* ─────────────────────────── component ──────────────────────── */
export default function NodeNetwork() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canGL() || !containerRef.current) {
      window.dispatchEvent(new Event('threejs-loaded'));
      return;
    }
    const container = containerRef.current;

    /* ── Renderer ── */
    const renderer = new THREE.WebGLRenderer({
      antialias: true, alpha: true, powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(innerWidth, innerHeight);
    container.appendChild(renderer.domElement);

    /* ── Scene / Camera ── */
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 100);
    camera.position.z = 8;

    // Root group – rotated by mouse; cheap, no position math
    const group = new THREE.Group();
    scene.add(group);

    /* ── Node positions (fixed, never rebuilt) ── */
    const pos = new Float32Array(N * 3); // world positions
    for (let i = 0; i < N; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 7;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 5;
    }

    /* ── Build edge list (done once) ── */
    type Edge = [number, number];
    const edges: Edge[] = [];
    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        const dx = pos[i*3]   - pos[j*3];
        const dy = pos[i*3+1] - pos[j*3+1];
        const dz = pos[i*3+2] - pos[j*3+2];
        if (dx*dx + dy*dy + dz*dz < DIST * DIST) edges.push([i, j]);
      }
    }

    /* ── Glowing Nodes (ShaderMaterial + Points) ── */
    const phases = new Float32Array(N);
    const sizes  = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      phases[i] = Math.random() * Math.PI * 2;
      sizes[i]  = 5 + Math.random() * 7;
    }
    const nodeGeo = new THREE.BufferGeometry();
    nodeGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    nodeGeo.setAttribute('aPhase',   new THREE.BufferAttribute(phases, 1));
    nodeGeo.setAttribute('aSize',    new THREE.BufferAttribute(sizes, 1));

    const nodeMat = new THREE.ShaderMaterial({
      vertexShader:   nodeVert,
      fragmentShader: nodeFrag,
      uniforms: {
        uTime:   { value: 0 },
        uColorA: { value: new THREE.Color(0x6366f1) },
        uColorB: { value: new THREE.Color(0xa78bfa) },
      },
      transparent: true,
      depthWrite:  false,
      blending:    THREE.AdditiveBlending,
    });
    group.add(new THREE.Points(nodeGeo, nodeMat));

    /* ── Edges (static LineSegments – zero per-frame cost) ── */
    const linePts = new Float32Array(edges.length * 6);
    for (let e = 0; e < edges.length; e++) {
      const [a, b] = edges[e];
      linePts[e*6]   = pos[a*3];   linePts[e*6+1] = pos[a*3+1]; linePts[e*6+2] = pos[a*3+2];
      linePts[e*6+3] = pos[b*3];   linePts[e*6+4] = pos[b*3+1]; linePts[e*6+5] = pos[b*3+2];
    }
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePts, 3));
    const lineMat = new THREE.LineBasicMaterial({
      color:       0x8b5cf6,
      transparent: true,
      opacity:     0.14,
      depthWrite:  false,
      blending:    THREE.AdditiveBlending,
    });
    group.add(new THREE.LineSegments(lineGeo, lineMat));

    /* ── Data Pulses ── */
    const pulsePts    = new Float32Array(MAX_PULSES * 3).fill(9999);
    const pulseAlphas = new Float32Array(MAX_PULSES).fill(0);
    const pulseGeo = new THREE.BufferGeometry();
    const ppAttr = new THREE.BufferAttribute(pulsePts, 3);
    const paAttr = new THREE.BufferAttribute(pulseAlphas, 1);
    ppAttr.setUsage(THREE.DynamicDrawUsage);
    paAttr.setUsage(THREE.DynamicDrawUsage);
    pulseGeo.setAttribute('position', ppAttr);
    pulseGeo.setAttribute('aAlpha',   paAttr);

    const pulseMat = new THREE.ShaderMaterial({
      vertexShader:   pulseVert,
      fragmentShader: pulseFrag,
      uniforms:       {},
      transparent:    true,
      depthWrite:     false,
      blending:       THREE.AdditiveBlending,
    });
    group.add(new THREE.Points(pulseGeo, pulseMat));

    // Pulse state
    interface PulseState { edge: number; t: number; speed: number; dir: 1 | -1; }
    const pulseSt: (PulseState | null)[] = Array(MAX_PULSES).fill(null);

    function spawnPulse(slot: number) {
      if (!edges.length) return;
      const edge  = Math.floor(Math.random() * edges.length);
      const dir   = Math.random() < 0.5 ? 1 : -1 as 1 | -1;
      pulseSt[slot] = { edge, t: dir === 1 ? 0 : 1, speed: 0.3 + Math.random() * 0.5, dir };
    }
    // Stagger initial spawn
    for (let i = 0; i < MAX_PULSES; i++) {
      spawnPulse(i);
      if (pulseSt[i]) pulseSt[i]!.t = Math.random();
    }

    /* ── Mouse → group rotation ── */
    let targetRY = 0, targetRX = 0, curRY = 0, curRX = 0;
    const onMouse = (e: MouseEvent) => {
      targetRY = ((e.clientX / innerWidth)  - 0.5) * 0.5;
      targetRX = ((e.clientY / innerHeight) - 0.5) * -0.25;
    };
    window.addEventListener('mousemove', onMouse);

    /* ── Resize ── */
    const onResize = () => {
      if (innerWidth < 768) { container.innerHTML = ''; return; }
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
    };
    window.addEventListener('resize', onResize);

    setTimeout(() => window.dispatchEvent(new Event('threejs-loaded')), 350);

    /* ── Render loop ── */
    const clock = new THREE.Clock();
    let raf = 0;
    const tmp = new THREE.Vector3();

    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t   = clock.getElapsedTime();
      const dt  = clock.getDelta();

      // Node shader time
      (nodeMat.uniforms.uTime as { value: number }).value = t;

      // Smooth mouse rotation (lerp)
      curRY += (targetRY - curRY) * 0.055;
      curRX += (targetRX - curRX) * 0.055;
      group.rotation.y = curRY + Math.sin(t * 0.07) * 0.06;
      group.rotation.x = curRX + Math.sin(t * 0.05) * 0.03;

      // Update pulses (just vec3 lerp + write to buffer)
      for (let i = 0; i < MAX_PULSES; i++) {
        const p = pulseSt[i];
        if (!p) { spawnPulse(i); continue; }

        p.t += p.speed * dt * p.dir;

        const done = p.dir === 1 ? p.t >= 1 : p.t <= 0;
        if (done) { spawnPulse(i); continue; }

        const tc = Math.max(0, Math.min(1, p.t));
        const [a, b] = edges[p.edge];
        tmp.set(
          pos[a*3]   + (pos[b*3]   - pos[a*3])   * tc,
          pos[a*3+1] + (pos[b*3+1] - pos[a*3+1]) * tc,
          pos[a*3+2] + (pos[b*3+2] - pos[a*3+2]) * tc,
        );
        const off = i * 3;
        pulsePts[off]     = tmp.x;
        pulsePts[off + 1] = tmp.y;
        pulsePts[off + 2] = tmp.z;

        // Fade in/out at ends
        const fade = Math.min(tc * 6, 1) * Math.min((1 - tc) * 6, 1);
        pulseAlphas[i] = fade * 0.9;
      }
      ppAttr.needsUpdate = true;
      paAttr.needsUpdate = true;

      // Line opacity breathe
      lineMat.opacity = 0.11 + Math.sin(t * 0.4) * 0.03;

      renderer.render(scene, camera);
    };
    animate();

    /* ── Cleanup ── */
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('resize', onResize);
      nodeGeo.dispose(); nodeMat.dispose();
      lineGeo.dispose(); lineMat.dispose();
      pulseGeo.dispose(); pulseMat.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement))
        container.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={containerRef} id="canvas-container" />;
}
