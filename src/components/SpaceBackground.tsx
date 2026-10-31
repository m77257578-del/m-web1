import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  color: string;
  baseAlpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
  vx: number;
  vy: number;
  depth: number;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  opacity: number;
  life: number;
  maxLife: number;
}

export const SpaceBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Subtle, calm parallax on mouse move
    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = width / 2;
    let targetMouseY = height / 2;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initStars();
    };

    window.addEventListener('resize', handleResize);

    // Natural, restful starlight tones (no harsh neon colors)
    const starPalette = [
      '#ffffff', // Pure soft white
      '#f1f5f9', // Slate 100
      '#e2e8f0', // Slate 200
      '#cbd5e1', // Slate 300
      '#93c5fd', // Soft pale ice blue
      '#fed7aa', // Faint warm starlight
    ];

    let stars: Star[] = [];
    let shootingStars: ShootingStar[] = [];

    const initStars = () => {
      const isMobile = width < 768;
      // Balanced star density for a serene, uncluttered night sky
      const count = isMobile ? 55 : 120;
      stars = [];

      for (let i = 0; i < count; i++) {
        // Assign 3 subtle depth tiers: 1 (far), 2 (mid), 3 (near)
        const depth = Math.random() < 0.6 ? 1 : Math.random() < 0.85 ? 2 : 3;
        const size = depth === 1 
          ? 0.5 + Math.random() * 0.4 
          : depth === 2 
            ? 0.8 + Math.random() * 0.4 
            : 1.1 + Math.random() * 0.4;

        const baseAlpha = depth === 1 ? 0.35 + Math.random() * 0.3 : 0.6 + Math.random() * 0.35;

        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size,
          color: starPalette[Math.floor(Math.random() * starPalette.length)],
          baseAlpha,
          twinkleSpeed: 0.008 + Math.random() * 0.014, // Slow, peaceful breathing
          twinklePhase: Math.random() * Math.PI * 2,
          vx: (Math.random() - 0.5) * (0.015 * depth), // Ultra-gentle drift
          vy: (Math.random() - 0.5) * (0.015 * depth),
          depth,
        });
      }
    };

    initStars();

    // Occasional, rare shooting star (peaceful, gentle streak)
    const triggerShootingStar = () => {
      // Rare probability (~once every 20-30 seconds at 60fps)
      if (Math.random() < 0.0015 && shootingStars.length < 1) {
        shootingStars.push({
          x: Math.random() * (width * 0.75),
          y: Math.random() * (height * 0.35),
          length: 60 + Math.random() * 80,
          speed: 6 + Math.random() * 4,
          angle: Math.PI / 4 + (Math.random() - 0.5) * 0.15,
          opacity: 0,
          life: 0,
          maxLife: 45 + Math.random() * 20,
        });
      }
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Very smooth, sluggish mouse follow (almost unnoticeable, comfortable depth)
      mouseX += (targetMouseX - mouseX) * 0.015;
      mouseY += (targetMouseY - mouseY) * 0.015;
      const baseParallaxX = (mouseX - width / 2) * 0.006;
      const baseParallaxY = (mouseY - height / 2) * 0.006;

      // Draw tranquil stars (No harsh lines, no clutter, no flashing)
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        // Gentle drift
        star.x += star.vx;
        star.y += star.vy;

        // Soft screen wrap
        if (star.x < 0) star.x = width;
        if (star.x > width) star.x = 0;
        if (star.y < 0) star.y = height;
        if (star.y > height) star.y = 0;

        // Smooth sinusoidal twinkle
        star.twinklePhase += star.twinkleSpeed;
        const twinkleFactor = 0.55 + 0.45 * Math.sin(star.twinklePhase);
        const finalAlpha = star.baseAlpha * twinkleFactor;

        const currentX = star.x + baseParallaxX * star.depth;
        const currentY = star.y + baseParallaxY * star.depth;

        ctx.beginPath();
        ctx.arc(currentX, currentY, star.size, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = finalAlpha;
        ctx.fill();

        // Very soft starlight glow for nearest stars only
        if (star.depth === 3 && star.size > 1.2) {
          ctx.beginPath();
          ctx.arc(currentX, currentY, star.size * 2, 0, Math.PI * 2);
          ctx.fillStyle = star.color;
          ctx.globalAlpha = finalAlpha * 0.15;
          ctx.fill();
        }
      }

      // Handle rare, soft shooting star
      triggerShootingStar();
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];
        s.life++;
        s.x += Math.cos(s.angle) * s.speed;
        s.y += Math.sin(s.angle) * s.speed;

        const progress = s.life / s.maxLife;
        // Fade in smoothly then fade out
        const alpha = progress < 0.25 
          ? (progress / 0.25) * 0.5 
          : ((1 - progress) / 0.75) * 0.5;

        const tailX = s.x - Math.cos(s.angle) * s.length;
        const tailY = s.y - Math.sin(s.angle) * s.length;

        const grad = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        grad.addColorStop(0.7, `rgba(203, 213, 225, ${alpha * 0.5})`);
        grad.addColorStop(1, `rgba(255, 255, 255, ${alpha})`);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(s.x, s.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.0;
        ctx.stroke();

        if (s.life >= s.maxLife) {
          shootingStars.splice(i, 1);
        }
      }

      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden" 
      aria-hidden="true"
    >
      {/* Calm, Deep Space Gradient Base - Restful on the eyes */}
      <div className="absolute inset-0 bg-[#030712]" />

      {/* Very subtle, dark, static celestial nebulae (zero pulsing or rapid movement) */}
      <div 
        className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-slate-900/40 blur-[160px] opacity-60" 
      />
      <div 
        className="absolute top-1/2 -right-32 w-[650px] h-[650px] rounded-full bg-indigo-950/25 blur-[180px] opacity-50" 
      />
      <div 
        className="absolute -bottom-32 left-1/4 w-[700px] h-[700px] rounded-full bg-blue-950/20 blur-[180px] opacity-40" 
      />

      {/* Gentle, comfortable edge vignette to focus reader attention */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 40%, transparent 50%, rgba(3, 7, 18, 0.65) 100%)',
        }}
      />

      {/* Pure, Serene Starfield Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block"
      />
    </div>
  );
};
