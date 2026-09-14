import React, { useEffect, useRef } from 'react';

interface FireworksOverlayProps {
  durationMs?: number;
  onComplete?: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  decay: number;
  color: string;
  size: number;
  shimmer: boolean;
  history: { x: number; y: number }[];
}

interface Rocket {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetY: number;
  color: string;
  exploded: boolean;
}

interface ConfettiPiece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  oscillationSpeed: number;
  oscillationAngle: number;
}

const PALETTE = [
  '#00f0ff', // Electric Cyan
  '#10b981', // Phosphor Emerald
  '#a855f7', // Neon Violet
  '#f59e0b', // Radiant Amber / Gold
  '#f43f5e', // Neon Rose
  '#ffffff', // Pure White Flash
  '#38bdf8', // Sky
];

export default function FireworksOverlay({ durationMs = 2600, onComplete }: FireworksOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let isActive = true;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    const particles: Particle[] = [];
    const rockets: Rocket[] = [];
    const confetti: ConfettiPiece[] = [];

    const playFireworkBurstSound = () => {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;
        const audioCtx = new AudioCtx();
        if (audioCtx.state === 'suspended') {
          audioCtx.resume().catch(() => {});
        }

        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.35);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
      } catch {
      }
    };

    const explodeRocket = (x: number, y: number, color: string) => {
      playFireworkBurstSound();
      const count = 55 + Math.floor(Math.random() * 30);
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.5 + Math.random() * 6.5;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          decay: 0.012 + Math.random() * 0.018,
          color: Math.random() > 0.3 ? color : PALETTE[Math.floor(Math.random() * PALETTE.length)],
          size: 1.5 + Math.random() * 2,
          shimmer: Math.random() > 0.5,
          history: [],
        });
      }
    };

    const spawnRocket = (startX?: number, targetY?: number) => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const x = startX !== undefined ? startX : width * (0.15 + Math.random() * 0.7);
      const tY = targetY !== undefined ? targetY : height * (0.15 + Math.random() * 0.35);
      const vy = -(9 + Math.random() * 5);
      rockets.push({
        x,
        y: height + 10,
        vx: (Math.random() - 0.5) * 2,
        vy,
        targetY: tY,
        color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
        exploded: false,
      });
    };

    setTimeout(() => {
      if (!isActive) return;
      spawnRocket(window.innerWidth * 0.35, window.innerHeight * 0.28);
      spawnRocket(window.innerWidth * 0.65, window.innerHeight * 0.25);
    }, 50);

    setTimeout(() => {
      if (!isActive) return;
      spawnRocket(window.innerWidth * 0.5, window.innerHeight * 0.2);
    }, 250);

    setTimeout(() => {
      if (!isActive) return;
      spawnRocket(window.innerWidth * 0.22, window.innerHeight * 0.3);
      spawnRocket(window.innerWidth * 0.78, window.innerHeight * 0.32);
    }, 600);

    setTimeout(() => {
      if (!isActive) return;
      spawnRocket(window.innerWidth * 0.4, window.innerHeight * 0.22);
      spawnRocket(window.innerWidth * 0.6, window.innerHeight * 0.24);
    }, 1100);

    const confettiCount = 70;
    for (let i = 0; i < confettiCount; i++) {
      confetti.push({
        x: Math.random() * window.innerWidth,
        y: -10 - Math.random() * 300,
        vx: (Math.random() - 0.5) * 2.5,
        vy: 2 + Math.random() * 3.5,
        size: 5 + Math.random() * 6,
        color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 8,
        oscillationSpeed: 0.04 + Math.random() * 0.05,
        oscillationAngle: Math.random() * Math.PI * 2,
      });
    }

    const render = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      ctx.clearRect(0, 0, width, height);

      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.x += r.vx;
        r.y += r.vy;
        r.vy += 0.06; // slight gravity

        ctx.save();
        ctx.fillStyle = r.color;
        ctx.shadowColor = r.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(r.x, r.y, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(r.x, r.y);
        ctx.lineTo(r.x - r.vx * 2, r.y - r.vy * 1.5);
        ctx.stroke();
        ctx.restore();

        if (r.y <= r.targetY || r.vy >= -1) {
          explodeRocket(r.x, r.y, r.color);
          rockets.splice(i, 1);
        }
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        p.history.push({ x: p.x, y: p.y });
        if (p.history.length > 4) p.history.shift();

        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.965; // air drag
        p.vy *= 0.965;
        p.vy += 0.085; // gravity
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        const displayAlpha = p.shimmer ? Math.max(0.1, p.alpha * (0.6 + Math.random() * 0.4)) : p.alpha;
        ctx.globalAlpha = displayAlpha;

        if (p.history.length > 1) {
          ctx.strokeStyle = p.color;
          ctx.lineWidth = p.size;
          ctx.beginPath();
          ctx.moveTo(p.history[0].x, p.history[0].y);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        }

        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      for (let i = confetti.length - 1; i >= 0; i--) {
        const c = confetti[i];
        c.y += c.vy;
        c.oscillationAngle += c.oscillationSpeed;
        c.x += c.vx + Math.sin(c.oscillationAngle) * 1.2;
        c.rotation += c.rotationSpeed;

        if (c.y > height + 20) {
          confetti.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate((c.rotation * Math.PI) / 180);
        const scaleX = Math.cos(c.oscillationAngle * 2);
        ctx.scale(scaleX, 1);

        ctx.fillStyle = c.color;
        ctx.fillRect(-c.size / 2, -c.size / 4, c.size, c.size / 2);
        ctx.restore();
      }

      if (isActive) {
        animId = requestAnimationFrame(render);
      }
    };

    animId = requestAnimationFrame(render);

    const endTimer = setTimeout(() => {
      isActive = false;
      onComplete?.();
    }, durationMs);

    return () => {
      isActive = false;
      cancelAnimationFrame(animId);
      clearTimeout(endTimer);
      window.removeEventListener('resize', resize);
    };
  }, [durationMs, onComplete]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[100] w-full h-full"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
