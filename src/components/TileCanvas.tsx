
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
      ctx.clearRect(0, 0, width, height);

      if (width > 0 && height > 0) {
        const cx = width / 2;
        const cy = height / 2;
        const radius = Math.min(cx, cy) * 0.38;

        const accent =
          getComputedStyle(document.documentElement)
            .getPropertyValue('--lime')
            .trim() || '#00d4ff';

        ctx.strokeStyle = accent;
        ctx.globalAlpha = 0.75;
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        ctx.arc(
          cx,
          cy,
          radius,
          angle,
          angle + Math.PI * 1.4
        );
        ctx.stroke();

        ctx.globalAlpha = 1;
        angle += 0.02;
      }

      animId = requestAnimationFrame(render);
    };

    resizeCanvas();

    const observer = new ResizeObserver(() => {
      resizeCanvas();
    });

    observer.observe(canvas);

    render();

    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
      ctx.clearRect(0, 0, width, height);
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
