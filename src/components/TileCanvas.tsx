
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
    let angle = 0;
    let width = 0;
    let height = 0;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      width = rect.width;
      height = rect.height;

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const render = () => {
      if (!width || !height) {
        resizeCanvas();
      }

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(cx, cy) * 0.38;

      ctx.strokeStyle = 'rgba(200, 255, 0, 0.45)';
      ctx.lineWidth = 1.5;

      // Keep the existing circular animation.
      ctx.beginPath();
      ctx.arc(
        cx,
        cy,
        radius,
        angle,
        angle + Math.PI * 1.4
      );
      ctx.stroke();

      angle += 0.02;
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
