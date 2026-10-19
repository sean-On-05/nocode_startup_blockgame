import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { GEM_COLORS } from '../game/colors';

export interface ParticleCanvasHandle {
  burstLines: (cells: { x: number; y: number; colorId: number }[], combo: number) => void;
  triggerScreenShake: (intensity: number) => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  rotation: number;
  vRot: number;
  shape: 'circle' | 'square' | 'star';
  life: number;
  maxLife: number;
}

interface SparkRing {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  alpha: number;
}

export const ParticleCanvas = forwardRef<ParticleCanvasHandle, { onShakeChange?: (x: number, y: number) => void }>(
  ({ onShakeChange }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const particlesRef = useRef<Particle[]>([]);
    const ringsRef = useRef<SparkRing[]>([]);
    const animIdRef = useRef<number | null>(null);
    const shakeRef = useRef<{ intensity: number; decay: number }>({ intensity: 0, decay: 0.88 });

    useImperativeHandle(ref, () => ({
      burstLines: (cells, combo) => {
        const particles = particlesRef.current;
        const rings = ringsRef.current;
        const particleCountPerCell = Math.min(24, 12 + combo * 2);

        cells.forEach((cell) => {
          const gem = GEM_COLORS[cell.colorId] || GEM_COLORS[0];
          
          // Add expanding shockwave ring
          rings.push({
            x: cell.x,
            y: cell.y,
            radius: 8,
            maxRadius: 36 + combo * 4,
            color: gem.accent,
            alpha: 0.9,
          });

          // Emit jewel shards
          for (let i = 0; i < particleCountPerCell; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * (4 + combo * 1.5);
            const shapes: ('circle' | 'square' | 'star')[] = ['circle', 'square', 'star'];
            const shape = shapes[Math.floor(Math.random() * shapes.length)];
            const maxLife = 35 + Math.random() * 25;

            particles.push({
              x: cell.x,
              y: cell.y,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed - 1.2, // slight upward bias
              size: 2.5 + Math.random() * 4.5,
              color: Math.random() > 0.3 ? gem.hex : '#ffffff',
              alpha: 1,
              rotation: Math.random() * Math.PI,
              vRot: (Math.random() - 0.5) * 0.25,
              shape,
              life: 0,
              maxLife,
            });
          }
        });

        startLoopIfNeeded();
      },
      triggerScreenShake: (intensity) => {
        shakeRef.current.intensity = Math.max(shakeRef.current.intensity, intensity);
        startLoopIfNeeded();
      },
    }));

    const startLoopIfNeeded = () => {
      if (!animIdRef.current) {
        animIdRef.current = requestAnimationFrame(render);
      }
    };

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Handle canvas resize
      if (canvas.width !== canvas.offsetWidth || canvas.height !== canvas.offsetHeight) {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Handle screen shake
      const shake = shakeRef.current;
      if (shake.intensity > 0.2) {
        const sx = (Math.random() - 0.5) * shake.intensity * 2;
        const sy = (Math.random() - 0.5) * shake.intensity * 2;
        if (onShakeChange) onShakeChange(sx, sy);
        shake.intensity *= shake.decay;
      } else if (shake.intensity > 0) {
        shake.intensity = 0;
        if (onShakeChange) onShakeChange(0, 0);
      }

      // Render expanding shockwave rings
      for (let i = ringsRef.current.length - 1; i >= 0; i--) {
        const ring = ringsRef.current[i];
        ring.radius += 2.4;
        ring.alpha -= 0.04;

        if (ring.alpha <= 0 || ring.radius >= ring.maxRadius) {
          ringsRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
        ctx.strokeStyle = ring.color;
        ctx.globalAlpha = Math.max(0, ring.alpha);
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.restore();
      }

      // Render particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12; // gravity
        p.vx *= 0.97; // drag
        p.rotation += p.vRot;
        p.life += 1;
        p.alpha = Math.max(0, 1 - p.life / p.maxLife);

        if (p.life >= p.maxLife || p.alpha <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;

        if (p.shape === 'star') {
          // Draw diamond glint
          ctx.beginPath();
          ctx.moveTo(0, -p.size * 1.4);
          ctx.lineTo(p.size * 0.6, 0);
          ctx.lineTo(0, p.size * 1.4);
          ctx.lineTo(-p.size * 0.6, 0);
          ctx.closePath();
          ctx.fill();
        } else if (p.shape === 'square') {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      // Continue loop if active
      if (particlesRef.current.length > 0 || ringsRef.current.length > 0 || shakeRef.current.intensity > 0.2) {
        animIdRef.current = requestAnimationFrame(render);
      } else {
        animIdRef.current = null;
      }
    };

    useEffect(() => {
      return () => {
        if (animIdRef.current) {
          cancelAnimationFrame(animIdRef.current);
        }
      };
    }, []);

    return (
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-30"
      />
    );
  }
);
