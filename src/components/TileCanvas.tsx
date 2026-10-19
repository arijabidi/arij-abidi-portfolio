
import { useEffect, useRef } from 'react';

interface TileCanvasProps {
  id: string;
  type: string;
  className?: string;
}

export function TileCanvas({
  id,
  type,
  className,
}: TileCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let width = 0;
    let height = 0;
    let time = 0;

    const spacing = 24;
    const points: { x: number; y: number; phase: number }[] = [];

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      width = rect.width;
      height = rect.height;

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      points.length = 0;

      for (let y = spacing; y < height; y += spacing) {
        for (let x = spacing; x < width; x += spacing) {
          points.push({
            x,
            y,
            phase: Math.random() * Math.PI * 2,
          });
        }
      }
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const wave = (x: number, y: number) =>
        Math.sin(x * 0.025 + time) *
        Math.cos(y * 0.025 + time * 0.7);

      // Draw connections between nearby points.
      ctx.lineWidth = 0.7;

      for (let i = 0; i < points.length; i++) {
        const a = points[i];

        for (let j = i + 1; j < points.length; j++) {
          const b = points[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < spacing * 1.6) {
            const alpha =
              (1 - distance / (spacing * 1.6)) *
              (0.12 + Math.max(0, wave(a.x, a.y)) * 0.22);

            ctx.strokeStyle = `rgba(0, 212, 255, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Draw animated blue nodes.
      points.forEach((point) => {
        const pulse =
          0.45 + 0.55 * Math.sin(time * 1.5 + point.phase);
        const offset = wave(point.x, point.y) * 3;
        const radius = 1.1 + pulse * 1.1;

        ctx.beginPath();
        ctx.arc(point.x, point.y + offset, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 212, 255, ${0.35 + pulse * 0.65})`;
        ctx.shadowBlur = 7 * pulse;
        ctx.shadowColor = '#00d4ff';
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      time += 0.018;
      animId = requestAnimationFrame(render);
    };

    resizeCanvas();
    render();

    window.addEventListener('resize', resizeCanvas);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [id, type]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
      }}
    />
  );
}
