/**
 * Three.js Neural Network Particle Field
 * Interactive 3D particle system with connections that responds to mouse movement.
 */
import * as THREE from 'three';

let renderer, scene, camera, particleGroup, linesMesh;
let positions, velocities, colors, particleCount;
let mouseWorld = new THREE.Vector2(9999, 9999);
let mouseDown = false;
let clock;
let linePositions, lineColors, maxLines;
let animationId;

export async function initHero(canvas, options = {}) {
  if (!canvas) return;

  const isMobile = options.reducedParticles || false;
  particleCount = isMobile ? 400 : 1200;
  maxLines = isMobile ? 0 : 1500;

  // Scene
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0a0a0f, 0.06);

  // Camera
  camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.z = 5;

  // Renderer
  renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: !isMobile,
    powerPreference: 'high-performance'
  });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Particles
  const geometry = new THREE.BufferGeometry();
  positions = new Float32Array(particleCount * 3);
  velocities = new Float32Array(particleCount * 3);
  colors = new Float32Array(particleCount * 3);

  const violet = new THREE.Color(0x6c63ff);
  const teal = new THREE.Color(0x00d4aa);
  const tempColor = new THREE.Color();

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;

    // Spherical distribution
    const radius = 3.5 + Math.random() * 1.5;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i3 + 2] = radius * Math.cos(phi);

    // Small random velocities
    velocities[i3] = (Math.random() - 0.5) * 0.02;
    velocities[i3 + 1] = (Math.random() - 0.5) * 0.02;
    velocities[i3 + 2] = (Math.random() - 0.5) * 0.02;

    // Color mix
    const mix = Math.random();
    tempColor.lerpColors(violet, teal, mix);
    colors[i3] = tempColor.r;
    colors[i3 + 1] = tempColor.g;
    colors[i3 + 2] = tempColor.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: isMobile ? 0.04 : 0.03,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const particles = new THREE.Points(geometry, material);
  particleGroup = new THREE.Group();
  particleGroup.add(particles);
  scene.add(particleGroup);

  // Connection lines (desktop only)
  if (maxLines > 0) {
    const lineGeometry = new THREE.BufferGeometry();
    linePositions = new Float32Array(maxLines * 6); // 2 points per line, 3 coords each
    lineColors = new Float32Array(maxLines * 6);
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    lineGeometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));
    lineGeometry.setDrawRange(0, 0);

    const lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    linesMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(linesMesh);
  }

  // Clock
  clock = new THREE.Clock();

  // Mouse tracking
  const onMouseMove = (e) => {
    const rect = canvas.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    // Unproject to z=0 plane
    const vec = new THREE.Vector3(nx, ny, 0.5);
    vec.unproject(camera);
    const dir = vec.sub(camera.position).normalize();
    const dist = -camera.position.z / dir.z;
    const pos = camera.position.clone().add(dir.multiplyScalar(dist));
    mouseWorld.set(pos.x, pos.y);
  };

  const onMouseDown = () => { mouseDown = true; };
  const onMouseUp = () => { mouseDown = false; };

  if (!isMobile) {
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('mouseleave', () => {
      mouseWorld.set(9999, 9999);
      mouseDown = false;
    });
  }

  // Resize
  const onResize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  window.addEventListener('resize', onResize);

  // Animation loop
  function animate() {
    animationId = requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const elapsed = clock.getElapsedTime();

    const posAttr = particles.geometry.attributes.position;

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      // Mouse interaction
      const dx = positions[i3] - mouseWorld.x;
      const dy = positions[i3 + 1] - mouseWorld.y;
      const distSq = dx * dx + dy * dy;
      const interactRadius = 2.5;

      if (distSq < interactRadius * interactRadius && distSq > 0.001) {
        const dist = Math.sqrt(distSq);
        const force = (1 - dist / interactRadius) * 0.08;
        const dirX = dx / dist;
        const dirY = dy / dist;

        if (mouseDown) {
          // Attract
          velocities[i3] -= dirX * force;
          velocities[i3 + 1] -= dirY * force;
        } else {
          // Repel
          velocities[i3] += dirX * force;
          velocities[i3 + 1] += dirY * force;
        }
      }

      // Apply velocity
      positions[i3] += velocities[i3];
      positions[i3 + 1] += velocities[i3 + 1];
      positions[i3 + 2] += velocities[i3 + 2];

      // Sine wave drift
      positions[i3 + 1] += Math.sin(elapsed * 0.3 + i * 0.1) * 0.0008;

      // Dampen velocity
      velocities[i3] *= 0.97;
      velocities[i3 + 1] *= 0.97;
      velocities[i3 + 2] *= 0.97;

      // Soft boundary — pull back toward origin if too far
      const fromOrigin = Math.sqrt(
        positions[i3] ** 2 + positions[i3 + 1] ** 2 + positions[i3 + 2] ** 2
      );
      if (fromOrigin > 6) {
        const pullback = 0.002;
        positions[i3] -= positions[i3] * pullback;
        positions[i3 + 1] -= positions[i3 + 1] * pullback;
        positions[i3 + 2] -= positions[i3 + 2] * pullback;
      }
    }

    posAttr.needsUpdate = true;

    // Slow rotation
    particleGroup.rotation.y += 0.0008;
    particleGroup.rotation.x += 0.0002;

    // Update connection lines
    if (linesMesh && maxLines > 0) {
      updateLines();
    }

    renderer.render(scene, camera);
  }

  animate();

  // Return a resolved promise to signal first frame
  return Promise.resolve();
}

function updateLines() {
  let lineCount = 0;
  const connectionDist = 0.7;
  const connectionDistSq = connectionDist * connectionDist;
  const step = particleCount > 800 ? 3 : 2; // Sample fewer particles for performance

  for (let i = 0; i < particleCount && lineCount < maxLines; i += step) {
    const i3 = i * 3;
    for (let j = i + step; j < particleCount && lineCount < maxLines; j += step) {
      const j3 = j * 3;
      const dx = positions[i3] - positions[j3];
      const dy = positions[i3 + 1] - positions[j3 + 1];
      const dz = positions[i3 + 2] - positions[j3 + 2];
      const distSq = dx * dx + dy * dy + dz * dz;

      if (distSq < connectionDistSq) {
        const idx = lineCount * 6;
        const alpha = 1 - distSq / connectionDistSq;

        linePositions[idx] = positions[i3];
        linePositions[idx + 1] = positions[i3 + 1];
        linePositions[idx + 2] = positions[i3 + 2];
        linePositions[idx + 3] = positions[j3];
        linePositions[idx + 4] = positions[j3 + 1];
        linePositions[idx + 5] = positions[j3 + 2];

        // Color with alpha fade
        const c = alpha * 0.4;
        lineColors[idx] = 0.42 * c;
        lineColors[idx + 1] = 0.39 * c;
        lineColors[idx + 2] = 1.0 * c;
        lineColors[idx + 3] = 0.42 * c;
        lineColors[idx + 4] = 0.39 * c;
        lineColors[idx + 5] = 1.0 * c;

        lineCount++;
      }
    }
  }

  linesMesh.geometry.setDrawRange(0, lineCount * 2);
  linesMesh.geometry.attributes.position.needsUpdate = true;
  linesMesh.geometry.attributes.color.needsUpdate = true;
}

export function disposeHero() {
  if (animationId) cancelAnimationFrame(animationId);
  if (renderer) renderer.dispose();
}
