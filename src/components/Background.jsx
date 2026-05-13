import { useEffect, useRef } from 'react';

const SYMBOLS = ['✕', '○'];
const COUNT   = 28;

function initParticles(W, H) {
  return Array.from({ length: COUNT }, (_, i) => ({
    x:        Math.random() * W,
    y:        Math.random() * H,
    sym:      SYMBOLS[i % 2],
    size:     14 + Math.random() * 16,
    speed:    0.18 + Math.random() * 0.22,
    drift:    (Math.random() - 0.5) * 0.12,
    alpha:    0.04 + Math.random() * 0.06,
    rotation: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.006,
  }));
}

export default function Background() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    let W = 0, H = 0, raf;
    let particles = [];

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
      particles = initParticles(W, H);
    }

    function draw() {
      const dark = document.body.classList.contains('dark-mode');
      ctx.clearRect(0, 0, W, H);

      ctx.fillStyle = dark ? '#0d0b14' : '#f3f2f8';
      ctx.fillRect(0, 0, W, H);

      // Dot grid — softer than line grid
      const step     = 52;
      const dotAlpha = dark ? 0.06 : 0.09;
      ctx.fillStyle  = dark
        ? `rgba(180, 160, 255, ${dotAlpha})`
        : `rgba(80, 40, 160, ${dotAlpha})`;
      for (let x = step; x < W; x += step) {
        for (let y = step; y < H; y += step) {
          ctx.beginPath();
          ctx.arc(x, y, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Animated floating symbols
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';

      for (const p of particles) {
        p.y        -= p.speed;
        p.x        += p.drift;
        p.rotation += p.rotSpeed;

        if (p.y < -40) { p.y = H + 40; p.x = Math.random() * W; }
        if (p.x < -40)  p.x = W + 40;
        if (p.x > W + 40) p.x = -40;

        const isX = p.sym === '✕';
        const r   = dark ? (isX ? 248 : 96)  : (isX ? 220 : 32);
        const g   = dark ? (isX ? 113 : 165) : (isX ? 32  : 96);
        const b   = dark ? (isX ? 113 : 250) : (isX ? 32  : 235);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.alpha;
        ctx.font        = `bold ${p.size}px 'DM Sans', system-ui`;
        ctx.fillStyle   = `rgb(${r}, ${g}, ${b})`;
        ctx.fillText(p.sym, 0, 0);
        ctx.restore();
      }
    }

    function loop() { draw(); raf = requestAnimationFrame(loop); }

    resize();
    loop();
    window.addEventListener('resize', resize);

    const observer = new MutationObserver(draw);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      observer.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} id="bg-canvas" />;
}
