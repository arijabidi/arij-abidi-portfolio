import { useEffect, useRef, useState } from 'react';

export function Preloader({
  label = 'Loading Portfolio',
  onComplete,
}: {
  label?: string;
  onComplete?: () => void;
}) {
  const [done, setDone] = useState(false);
  const countRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let count = 0;
    const timer = setInterval(() => {
      count += 2;
      if (countRef.current) {
        countRef.current.textContent = String(Math.min(count, 100)).padStart(2, '0');
      }
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${Math.min(count, 100) / 100})`;
      }
      if (count >= 100) {
        clearInterval(timer);
        if (wrapRef.current) {
          wrapRef.current.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
          wrapRef.current.style.opacity = '0';
          wrapRef.current.style.transform = 'translateY(-8px)';
          setTimeout(() => {
            setDone(true);
            onComplete?.();
          }, 600);
        }
      }
    }, 20);

    return () => clearInterval(timer);
  }, [onComplete]);

  if (done) return null;

  return (
    <div id="preloader" ref={wrapRef}>
      <div className="pre-count">
        <span ref={countRef}>00</span>
      </div>
      <div className="pre-right">
        <div className="pre-bar-wrap">
          <div className="pre-bar" ref={barRef} />
        </div>
        <span className="pre-label">{label}</span>
      </div>
    </div>
  );
}
