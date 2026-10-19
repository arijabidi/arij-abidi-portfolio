import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function DnaBackground({
  accentColor = '#c8ff00',
}: {
  type?: string;
  accentColor?: string;
  isAbsolute?: boolean;
  widthPercent?: number;
  alignRight?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 28;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const count = 320;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 8;
      const strand = i % 2 === 0 ? 1 : -1;
      positions[i * 3] = Math.cos(t) * 6 * strand;
      positions[i * 3 + 1] = (i / count) * 44 - 22;
      positions[i * 3 + 2] = Math.sin(t) * 6 * strand;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: new THREE.Color(accentColor),
      size: 0.35,
      transparent: true,
      opacity: 0.85,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);
    if (alignRight && window.innerWidth > 850) {
      points.position.x = 5.2;
    }

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      points.rotation.y += 0.006;
      points.rotation.x += 0.002;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      if (alignRight && window.innerWidth > 850) {
        points.position.x = 5.2;
      } else {
        points.position.x = 0;
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      container.innerHTML = '';
    };
  }, [accentColor, alignRight]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}
