// Geometric grid background — minimal, fits the board-game theme
import { useEffect, useRef } from 'react';

export default function Background() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let W = 0, H = 0, raf;

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }

    function draw() {
      const dark = document.body.classList.contains('dark-mode');
      ctx.clearRect(0, 0, W, H);

      // Base fill
      ctx.fillStyle = dark ? '#0f0f14' : '#f4f4f8';
      ctx.fillRect(0, 0, W, H);

      // Subtle grid lines
      const step  = 60;
      const alpha = dark ? 0.045 : 0.06;
      ctx.strokeStyle = dark
        ? `rgba(180,180,255,${alpha})`
        : `rgba(0,0,80,${alpha})`;
      ctx.lineWidth = 1;

      for (let x = 0; x <= W; x += step) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y <= H; y += step) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // Faint X and O symbols scattered across grid intersections
      const symbols = ['✕', '○'];
      const symAlpha = dark ? 0.055 : 0.07;
      ctx.font = 'bold 18px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Deterministic placement using grid indices
      let idx = 0;
      for (let x = step; x < W; x += step * 3) {
        for (let y = step; y < H; y += step * 3) {
          const sym = symbols[idx % 2];
          const isX = sym === '✕';
          ctx.fillStyle = isX
            ? `rgba(220,53,69,${symAlpha})`
            : `rgba(0,123,255,${symAlpha})`;
          ctx.fillText(sym, x, y);
          idx++;
        }
      }
    }

    function loop() { draw(); raf = requestAnimationFrame(loop); }

    resize();
    loop();
    const onResize = () => { resize(); };
    window.addEventListener('resize', onResize);

    // Redraw on theme change
    const observer = new MutationObserver(draw);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      observer.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} id="bg-canvas" />;
}
