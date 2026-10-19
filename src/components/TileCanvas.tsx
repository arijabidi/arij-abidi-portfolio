import { useEffect, useRef } from 'react';

interface TileCanvasProps {
  id: string;
  type: string;
  className?: string;
}

const col = (a: number) => `rgba(91, 184, 255, ${a})`;

export function TileCanvas({ id, type, className }: TileCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let t = 0;
    let width = 0;
    let height = 0;

    const nodes = Array.from({ length: 22 }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0016,
      vy: (Math.random() - 0.5) * 0.0016,
    }));

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      width = rect.width;
      height = rect.height;

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const dot = (x: number, y: number, r: number, a: number) => {
      ctx.fillStyle = col(a);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    };

    // Moving points connected by lines
    const drawNetwork = () => {
      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0.05 || n.x > 0.95) n.vx *= -1;
        if (n.y < 0.05 || n.y > 0.95) n.vy *= -1;
      });
      const maxD = Math.min(width, height) * 0.4;
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = (nodes[i].x - nodes[j].x) * width;
          const dy = (nodes[i].y - nodes[j].y) * height;
          const d = Math.hypot(dx, dy);
          if (d < maxD) {
            ctx.strokeStyle = col((1 - d / maxD) * 0.5);
            ctx.beginPath();
            ctx.moveTo(nodes[i].x * width, nodes[i].y * height);
            ctx.lineTo(nodes[j].x * width, nodes[j].y * height);
            ctx.stroke();
          }
        }
      }
      nodes.forEach((n) => dot(n.x * width, n.y * height, 2.5, 0.9));
    };

    // Layers of neurons with pulses travelling between them
    const drawNeural = () => {
      const layers = [3, 5, 5, 3];
      const pos = layers.map((n, li) =>
        Array.from({ length: n }, (_, k) => ({
          x: width * (0.15 + (0.7 * li) / (layers.length - 1)),
          y: height * (0.5 + (k - (n - 1) / 2) * 0.13),
        }))
      );
      ctx.lineWidth = 1;
      let idx = 0;
      for (let li = 0; li < pos.length - 1; li++) {
        for (const a of pos[li]) {
          for (const b of pos[li + 1]) {
            ctx.strokeStyle = col(0.18);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
            if (idx % 3 === 0) {
              const p = (t * 0.4 + idx * 0.37) % 1;
              dot(a.x + (b.x - a.x) * p, a.y + (b.y - a.y) * p, 2, 0.9);
            }
            idx++;
          }
        }
      }
      pos.flat().forEach((p) => dot(p.x, p.y, 4, 0.85));
    };

    // Double helix
    const drawDna = () => {
      const cx = width / 2;
      const amp = width * 0.18;
      const n = 20;
      for (let i = 0; i < n; i++) {
        const y = height * (0.1 + (0.8 * i) / (n - 1));
        const ph = t * 1.5 + i * 0.45;
        const x1 = cx + Math.sin(ph) * amp;
        const x2 = cx + Math.sin(ph + Math.PI) * amp;
        ctx.strokeStyle = col(0.15 + 0.25 * Math.abs(Math.cos(ph)));
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(x2, y);
        ctx.stroke();
        dot(x1, y, 3.5, 0.5 + 0.5 * ((Math.cos(ph) + 1) / 2));
        dot(x2, y, 3.5, 0.5 + 0.5 * ((-Math.cos(ph) + 1) / 2));
      }
    };

    // Rotating flower of circles
    const drawMandala = () => {
      const cx = width / 2;
      const cy = height / 2;
      const R = Math.min(cx, cy) * 0.55;
      ctx.lineWidth = 1;
      ctx.strokeStyle = col(0.4);
      for (let k = 0; k < 12; k++) {
        const a = t * 0.3 + (k * Math.PI * 2) / 12;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(a) * R * 0.5, cy + Math.sin(a) * R * 0.5, R * 0.5, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.strokeStyle = col(0.7);
      ctx.beginPath();
      for (let k = 0; k <= 6; k++) {
        const a = -t * 0.5 + (k * Math.PI * 2) / 6;
        const x = cx + Math.cos(a) * R * 0.45;
        const y = cy + Math.sin(a) * R * 0.45;
        if (k === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    };

    // Nucleus with 3 orbits and electrons
    const drawAtom = () => {
      const cx = width / 2;
      const cy = height / 2;
      const R = Math.min(cx, cy) * 0.6;
      dot(cx, cy, 7, 0.95);
      for (let i = 0; i < 3; i++) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate((i * Math.PI) / 3);
        ctx.strokeStyle = col(0.4);
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(0, 0, R, R * 0.35, 0, 0, Math.PI * 2);
        ctx.stroke();
        const a = t * 1.2 + i * 2;
        dot(R * Math.cos(a), R * 0.35 * Math.sin(a), 4, 0.95);
        ctx.restore();
      }
    };

    // Animated equalizer bars
    const drawSpectrum = () => {
      const bars = 24;
      const bw = (width * 0.7) / bars;
      const x0 = width * 0.15;
      for (let i = 0; i < bars; i++) {
        const h =
          (0.25 + 0.75 * Math.abs(Math.sin(t * 1.5 + i * 0.5) * Math.cos(t * 0.7 + i * 0.3))) *
          height *
          0.5;
        ctx.fillStyle = col(0.35 + 0.5 * (h / (height * 0.5)));
        ctx.fillRect(x0 + i * bw + 1, height / 2 - h / 2, bw - 2, h);
      }
    };

    const drawDefault = () => {
      const cx = width / 2;
      const cy = height / 2;
      ctx.strokeStyle = col(0.6);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, Math.min(cx, cy) * 0.38, t, t + Math.PI * 1.4);
      ctx.stroke();
    };

    const render = () => {
      if (!width || !height) {
        resizeCanvas();
      }

      ctx.clearRect(0, 0, width, height);

      if (width && height) {
        switch (type) {
          case 'network':
            drawNetwork();
            break;
          case 'neural':
            drawNeural();
            break;
          case 'dna':
            drawDna();
            break;
          case 'mandala':
            drawMandala();
            break;
          case 'atom':
            drawAtom();
            break;
          case 'spectrum':
            drawSpectrum();
            break;
          default:
            drawDefault();
        }
      }

      t += 0.02;
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
