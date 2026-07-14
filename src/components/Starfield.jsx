import { useEffect, useRef } from 'react';

/**
 * 星空背景（像素點）
 */
export default function Starfield() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;

    const stars = Array.from({ length: 80 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() < 0.7 ? 1 : 2,
      speed: Math.random() * 0.3 + 0.05,
      brightness: Math.random(),
      blinkRate: Math.random() * 0.02 + 0.005,
    }));

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach((s) => {
        s.brightness += s.blinkRate;
        const alpha = (Math.sin(s.brightness) + 1) / 2;
        ctx.fillStyle = `rgba(200, 200, 255, ${alpha * 0.8})`;
        ctx.fillRect(Math.floor(s.x), Math.floor(s.y), s.size, s.size);
      });
      animId = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        imageRendering: 'pixelated',
      }}
    />
  );
}
