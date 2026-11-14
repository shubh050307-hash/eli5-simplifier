import { useEffect, useRef } from 'react';

// Motion adapted from Roman Vasnev's MIT-licensed Dot Field preview:
// https://21st.dev/@romanvasnev/components/dot-field
const HEADLINE = 'Complex ideas simply explained';
const FONT = '"Plus Jakarta Sans", sans-serif';

export default function DotField() {
  const hostRef = useRef(null);
  const canvasRef = useRef(null);
  const glowRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    const glow = glowRef.current;
    const ctx = canvas.getContext('2d');
    const light = glow.getContext('2d');
    if (!ctx || !light) return undefined;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let width, height, particles = [], started = 0, frame, resizeTimer, startTimer;
    let active = true, visible = true, scatter = 0, lastScatter = 0, kick = 0;
    let previousFrame = 0;
    const mouse = { x: 0, y: 0, on: false };

    const build = () => {
      width = Math.max(1, Math.round(host.clientWidth));
      height = Math.max(1, Math.round(host.clientHeight));
      const ratio = Math.min(2, window.devicePixelRatio || 1);
      for (const layer of [canvas, glow]) {
        layer.width = width * ratio;
        layer.height = height * ratio;
      }
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      light.setTransform(ratio, 0, 0, ratio, 0, 0);
      const mask = document.createElement('canvas');
      mask.width = width;
      mask.height = height;
      const text = mask.getContext('2d', { willReadFrequently: true });
      let size = Math.min(width * .115, height * .2, 168);
      let lines;
      do {
        text.font = `600 ${size}px ${FONT}`;
        lines = [];
        let line = '';
        for (const word of HEADLINE.split(' ')) {
          const next = line ? `${line} ${word}` : word;
          if (line && text.measureText(next).width > width * .88) {
            lines.push(line);
            line = word;
          } else line = next;
        }
        lines.push(line);
        if (lines.length <= 3 && lines.every(line => text.measureText(line).width <= width * .92)) break;
        size *= .9;
      } while (size >= 28);
      text.textAlign = 'center';
      text.textBaseline = 'middle';
      text.letterSpacing = `${-size * .05}px`;
      lines.forEach((line, i) => text.fillText(line, width / 2, height * .46 + (i - (lines.length - 1) / 2) * size * .98));
      const pixels = text.getImageData(0, 0, width, height).data;
      const targets = [];
      const step = Math.max(3, Math.round(size / 30));
      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          if (pixels[(y * width + x) * 4 + 3] > 128) targets.push({ x, y });
        }
      }
      const columns = Math.ceil(width / 20) + 1;
      const gridCount = columns * (Math.ceil(height / 13) + 1);
      particles = Array.from({ length: Math.max(gridCount, targets.length) }, (_, i) => {
        const cell = i < gridCount ? i : Math.floor(Math.random() * gridCount);
        const x = cell % columns * 20 - 6;
        const y = Math.floor(cell / columns) * 13 - 1;
        return { x, y, gx: x, gy: y, vx: 0, vy: 0 };
      });
      const shuffled = [...particles];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      targets.forEach((target, i) => Object.assign(shuffled[i], {
        tx: target.x, ty: target.y,
        delay: .15 + Math.min(.9, Math.hypot(target.x - width / 2, target.y - height * .46) / Math.hypot(width, height)) * 1.1 + Math.random() * .25,
      }));
    };
    const scroll = () => {
      scatter = Math.min(1, Math.max(0, -host.getBoundingClientRect().top / (window.innerHeight * .7)));
    };
    const draw = (now) => {
      frame = requestAnimationFrame(draw);
      if (!visible || document.hidden || now - previousFrame < 1000 / 65) return;
      previousFrame = now;
      const time = (now - started) / 1000;
      kick = kick * .93 + Math.abs(scatter - lastScatter) * 6;
      lastScatter = scatter;
      ctx.clearRect(0, 0, width, height);
      light.clearRect(0, 0, width, height);
      ctx.fillStyle = '#f4f4f6';
      light.fillStyle = '#3c2cff';
      for (const p of particles) {
        const letter = p.tx !== undefined;
        const age = time - (p.delay || 0);
        let x = p.gx, y = p.gy, spring = .06, flow = 0;
        if (letter) {
          if (age > 0) {
            const spread = Math.min(1, scatter * (.8 + p.delay * .6));
            x = p.tx + (p.gx - p.tx) * spread;
            y = p.ty + (p.gy - p.ty) * spread;
            spring = Math.min(.09, .02 + age * .08);
          }
          flow = age > -1 ? Math.max(0, 1 - Math.max(0, age) * 1.4) : 0;
        }
        if (kick > .01) flow = Math.max(flow, Math.min(1, kick) * .9);
        if (motion.matches) {
          p.x = letter ? p.tx + (p.gx - p.tx) * scatter : p.gx;
          p.y = letter ? p.ty + (p.gy - p.ty) * scatter : p.gy;
        } else {
          let ax = (x - p.x) * spring, ay = (y - p.y) * spring;
          if (flow > 0) {
            const angle = (Math.sin(p.x * .004 + time * .7) + Math.cos(p.y * .005 - time * .5) + Math.sin((p.x + p.y) * .002 + time * .3)) * Math.PI;
            ax += Math.cos(angle) * 2.2 * flow;
            ay += Math.sin(angle) * 2.2 * flow;
          }
          const dx = p.x - mouse.x, dy = p.y - mouse.y;
          const distance = Math.hypot(dx, dy);
          if (mouse.on && distance < 120) {
            const force = (1 - distance / 120) * 6;
            ax += dx / (distance || 1) * force;
            ay += dy / (distance || 1) * force;
          }
          p.vx = (p.vx + ax) * .82;
          p.vy = (p.vy + ay) * .82;
          p.x += p.vx;
          p.y += p.vy;
        }
        const alpha = Math.min(.5, .12 + (Math.abs(p.vx) + Math.abs(p.vy)) * .05);
        if (letter) {
          const gathered = motion.matches ? 1 - scatter : Math.min(1, Math.max(0, age * 1.2)) * (1 - scatter);
          ctx.globalAlpha = (.34 + gathered * .6) * (1 - scatter) + alpha * scatter;
          const radius = 1 - scatter * .25;
          ctx.fillRect(p.x - radius, p.y - radius, radius * 2, radius * 2);
          const sweep = Math.max(0, 1 - Math.abs(p.x / width - (time * .35 % 1.6 - .3)) * 7);
          light.globalAlpha = (sweep * .9 + (1 - gathered) * .25) * (1 - scatter);
          if (!motion.matches) light.fillRect(p.x - 2, p.y - 2, 4, 4);
        } else {
          ctx.globalAlpha = alpha;
          ctx.fillRect(p.x - .75, p.y - .75, 1.5, 1.5);
        }
      }
    };
    const move = (event) => {
      const bounds = host.getBoundingClientRect();
      Object.assign(mouse, { x: event.clientX - bounds.left, y: event.clientY - bounds.top, on: true });
      host.style.setProperty('--pointer-x', `${mouse.x}px`);
      host.style.setProperty('--pointer-y', `${mouse.y}px`);
    };
    const leave = () => { mouse.on = false; };
    const observer = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { build(); started = performance.now() - 3000; scroll(); }, 150);
    });
    const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    document.fonts.ready.then(() => {
      if (!active) return;
      build();
      observer.observe(host);
      intersection.observe(host);
      // Observe initial dimensions before starting the gathering animation.
      startTimer = setTimeout(() => { started = performance.now(); scroll(); frame = requestAnimationFrame(draw); }, 180);
    });
    host.addEventListener('pointermove', move);
    host.addEventListener('pointerleave', leave);
    window.addEventListener('scroll', scroll, { passive: true, capture: true });
    return () => {
      active = false;
      cancelAnimationFrame(frame);
      clearTimeout(startTimer);
      clearTimeout(resizeTimer);
      observer.disconnect();
      intersection.disconnect();
      host.removeEventListener('pointermove', move);
      host.removeEventListener('pointerleave', leave);
      window.removeEventListener('scroll', scroll, { capture: true });
    };
  }, []);

  return (
    <div ref={hostRef} className="dot-field">
      <canvas ref={glowRef} className="dot-field-glow" aria-hidden="true" />
      <canvas ref={canvasRef} aria-hidden="true" />
      <div className="dot-field-pointer" aria-hidden="true" />
      <h1 className="sr-only">{HEADLINE}</h1>
    </div>
  );
}
