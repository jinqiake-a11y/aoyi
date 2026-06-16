import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeBackgroundProps {
  accentColor?: number;
  accentColor2?: number;
  bgColor?: number;
}

export default function ThreeBackground({
  accentColor = 0x3b82f6,   /* electric blue */
  accentColor2 = 0x818cf8,  /* soft indigo */
  bgColor = 0x0b1120,       /* deep navy */
}: ThreeBackgroundProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const W = () => window.innerWidth;
    const H = () => window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(bgColor);
    scene.fog = new THREE.FogExp2(bgColor, 0.001);

    const camera = new THREE.PerspectiveCamera(75, W() / H(), 0.1, 1200);
    camera.position.z = 280;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W(), H());
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // ── Data Node Particles ──
    const N = 280;
    const pos = new Float32Array(N * 3);
    const col = new Float32Array(N * 3);

    const r1 = ((accentColor >> 16) & 255) / 255;
    const g1 = ((accentColor >> 8) & 255) / 255;
    const b1 = (accentColor & 255) / 255;
    const r2 = ((accentColor2 >> 16) & 255) / 255;
    const g2 = ((accentColor2 >> 8) & 255) / 255;
    const b2 = (accentColor2 & 255) / 255;

    for (let i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 700;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 700;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 500;
      // Mix blue and indigo nodes
      if (Math.random() > 0.45) {
        col[i * 3] = r1; col[i * 3 + 1] = g1; col[i * 3 + 2] = b1;
      } else {
        col[i * 3] = r2; col[i * 3 + 1] = g2; col[i * 3 + 2] = b2;
      }
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));

    const pMat = new THREE.PointsMaterial({
      size: 2.0,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
    });
    const pts = new THREE.Points(pGeo, pMat);
    scene.add(pts);

    // ── Network Connections ──
    const lMat = new THREE.LineBasicMaterial({
      color: accentColor,
      transparent: true,
      opacity: 0.07,
      blending: THREE.AdditiveBlending,
    });
    const lGeo = new THREE.BufferGeometry();
    const lines = new THREE.LineSegments(lGeo, lMat);
    scene.add(lines);

    // ── Data Orbs (glowing nodes) ──
    const orbs: THREE.Mesh[] = [];
    for (let i = 0; i < 7; i++) {
      const radius = 1 + Math.random() * 2;
      const g = new THREE.SphereGeometry(radius, 16, 16);
      const m = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? accentColor : accentColor2,
        transparent: true,
        opacity: 0.18,
      });
      const o = new THREE.Mesh(g, m);
      o.position.set(
        (Math.random() - 0.5) * 450,
        (Math.random() - 0.5) * 450,
        (Math.random() - 0.5) * 250,
      );
      o.userData.spd = 0.06 + Math.random() * 0.2;
      o.userData.phase = Math.random() * Math.PI * 2;
      scene.add(o);
      orbs.push(o);
    }

    // ── Geometric Grid (tech floor) ──
    const gridGeo = new THREE.PlaneGeometry(900, 900, 36, 36);
    const gridMat = new THREE.MeshBasicMaterial({
      color: accentColor,
      wireframe: true,
      transparent: true,
      opacity: 0.018,
    });
    const grid = new THREE.Mesh(gridGeo, gridMat);
    grid.rotation.x = -Math.PI / 2.2;
    grid.position.y = -180;
    scene.add(grid);

    // ── Mouse tracking ──
    let mx = 0, my = 0;
    const onMM = (e: MouseEvent) => {
      mx = (e.clientX / W() - 0.5) * 2;
      my = (e.clientY / H() - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMM);

    // ── Animation Loop — precise, data-driven ──
    const MAX_D = 110;
    let aid: number;
    const animate = () => {
      aid = requestAnimationFrame(animate);
      const t = Date.now() * 0.001;

      // Steady rotation — tech precision
      pts.rotation.y += 0.0003;
      pts.rotation.x += 0.00008;
      grid.rotation.z += 0.0002;

      // Steady particle opacity
      pMat.opacity = 0.55 + Math.sin(t * 0.4) * 0.1;

      // Update network connections
      const pa = pGeo.attributes.position.array as Float32Array;
      const lp: number[] = [];
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = pa[i * 3] - pa[j * 3];
          const dy = pa[i * 3 + 1] - pa[j * 3 + 1];
          const dz = pa[i * 3 + 2] - pa[j * 3 + 2];
          if (dx * dx + dy * dy + dz * dz < MAX_D * MAX_D) {
            lp.push(
              pa[i * 3], pa[i * 3 + 1], pa[i * 3 + 2],
              pa[j * 3], pa[j * 3 + 1], pa[j * 3 + 2],
            );
          }
        }
      }
      lGeo.setAttribute('position', new THREE.Float32BufferAttribute(lp, 3));

      // Animate orbs — structured orbits
      orbs.forEach((o, i) => {
        const spd = o.userData.spd;
        const phase = o.userData.phase;
        o.position.x += Math.sin(t * spd + phase) * 0.25;
        o.position.y += Math.cos(t * spd * 0.8 + phase) * 0.18;
        (o.material as THREE.MeshBasicMaterial).opacity =
          0.12 + Math.sin(t * 0.6 + i * 0.8) * 0.06;
      });

      // Camera parallax — responsive
      camera.position.x += (mx * 35 - camera.position.x) * 0.015;
      camera.position.y += (-my * 30 - camera.position.y) * 0.015;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };
    animate();

    // ── Resize handler ──
    const onR = () => {
      camera.aspect = W() / H();
      camera.updateProjectionMatrix();
      renderer.setSize(W(), H());
    };
    window.addEventListener('resize', onR);

    // ── Cleanup ──
    return () => {
      window.removeEventListener('mousemove', onMM);
      window.removeEventListener('resize', onR);
      cancelAnimationFrame(aid);
      pGeo.dispose(); pMat.dispose();
      lGeo.dispose(); lMat.dispose();
      gridGeo.dispose(); gridMat.dispose();
      orbs.forEach(o => { o.geometry.dispose(); (o.material as THREE.Material).dispose(); });
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, [accentColor, accentColor2, bgColor]);

  return (
    <div
      ref={mountRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
