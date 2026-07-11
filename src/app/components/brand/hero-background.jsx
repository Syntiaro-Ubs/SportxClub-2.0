import { useEffect, useRef } from "react";
export function HeroBackground() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let W,
      H,
      time = 0,
      raf;
    class Particle {
      x = 0;
      y = 0;
      r = 0;
      vx = 0;
      vy = 0;
      alpha = 0;
      life = 0;
      maxLife = 0;
      green = true;
      constructor(rand) {
        this.reset(rand);
      }
      reset(rand) {
        this.x = Math.random() * W;
        this.y = rand ? Math.random() * H : H + 10;
        this.r = Math.random() * 2.5 + 0.5;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = -(Math.random() * 0.5 + 0.1);
        this.alpha = Math.random() * 0.5 + 0.1;
        this.life = 0;
        this.maxLife = Math.random() * 250 + 120;
        this.green = Math.random() > 0.5;
      }
      update() {
        this.x += this.vx + Math.sin(time * 0.01 + this.y * 0.02) * 0.15;
        this.y += this.vy;
        this.life++;
        if (this.life > this.maxLife || this.y < -10) this.reset(false);
      }
      draw() {
        const fade = 1 - this.life / this.maxLife;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = this.green
          ? `rgba(34,197,94,${this.alpha * fade})`
          : `rgba(255,255,255,${this.alpha * 0.8 * fade})`;
        ctx.fill();
      }
    }
    let particles = [];
    function resize() {
      const parent = canvas.parentElement;
      if (!parent) return;
      W = canvas.width = parent.offsetWidth;
      H = canvas.height = parent.offsetHeight;
      particles = Array.from({ length: 75 }, () => new Particle(true));
    }
    function drawField() {
      ctx.clearRect(0, 0, W, H);
      const g = ctx.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, "#0d2f1c");
      g.addColorStop(0.5, "#184a2d");
      g.addColorStop(1, "#22663e");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      const stripeW = W / 10;
      for (let i = 0; i < 10; i++) {
        ctx.fillStyle =
          i % 2 === 0 ? "rgba(34,197,94,0.08)" : "rgba(34,197,94,0.04)";
        ctx.fillRect(i * stripeW, 0, stripeW, H);
      }

      ctx.strokeStyle = "rgba(34,197,94,0.35)";
      ctx.lineWidth = 1.2;
      const mx = W * 0.07,
        my = H * 0.06;
      ctx.strokeRect(mx, my, W - mx * 2, H - my * 2);
      ctx.beginPath();
      ctx.moveTo(W / 2, my);
      ctx.lineTo(W / 2, H - my);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(W / 2, H / 2, H * 0.2, 0, Math.PI * 2);
      ctx.stroke();
      const bw = W * 0.16,
        bh = H * 0.42,
        sw2 = W * 0.07,
        sh = H * 0.22;
      ctx.strokeRect(mx, H / 2 - bh / 2, bw, bh);
      ctx.strokeRect(mx, H / 2 - sh / 2, sw2, sh);
      ctx.strokeRect(W - mx - bw, H / 2 - bh / 2, bw, bh);
      ctx.strokeRect(W - mx - sw2, H / 2 - sh / 2, sw2, sh);
    }
    function animate() {
      time++;
      drawField();
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      raf = requestAnimationFrame(animate);
    }
    resize();
    animate();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-50 pointer-events-none"
    />
  );
}
