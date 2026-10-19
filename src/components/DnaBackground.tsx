
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface DnaBackgroundProps {
  type?: string;
  accentColor?: string;
  isAbsolute?: boolean;
  widthPercent?: number;
  alignRight?: boolean;
}

export function DnaBackground({
  type = 'dna',
  accentColor = '#c8ff00',
  isAbsolute = true,
  widthPercent = 100,
  alignRight = false,
}: DnaBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 28;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
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

    geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
    );

    const material = new THREE.PointsMaterial({
      color: new THREE.Color(accentColor),
      size: 0.35,
      transparent: true,
      opacity: 0.85,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const resize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);

      points.position.x =
        alignRight && width > 850 ? 5.2 : 0;
    };

    resize();

    let animId = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      points.rotation.y += 0.006;
      points.rotation.x += 0.002;

      renderer.render(scene, camera);
    };

    animate();

    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);

      geometry.dispose();
      material.dispose();
      renderer.dispose();

      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [accentColor, alignRight, type]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{
        position: isAbsolute ? 'absolute' : 'fixed',
        top: 0,
        left: 0,
        width: `${Math.min(100, Math.max(0, widthPercent))}%`,
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}
    />
  );
}
