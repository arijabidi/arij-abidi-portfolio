import { useEffect, useRef } from 'react';

export function TileCanvas({
  className,
}: {
  id: string;
  type: string;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let angle = 0;

    const render = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      if (!w || !h) {
        animId = requestAnimationFrame(render);
        return;
      }

      const dpr = window.devicePixelRatio || 1;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = 'rgba(200, 255, 0, 0.45)';
      ctx.lineWidth = 1.5 * dpr;

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const rad = Math.min(cx, cy) * 0.38;

      ctx.beginPath();
      ctx.arc(cx, cy, rad, angle, angle + Math.PI * 1.4);
      ctx.stroke();

      angle += 0.02;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, []);

  return <canvas ref={canvasRef} className={className} style={{ width: '100%', height: '100%', display: 'block' }} />;
}
