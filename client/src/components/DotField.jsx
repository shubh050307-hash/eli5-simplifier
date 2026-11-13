import { useEffect, useRef } from 'react';

const DOT_SPACING = 22;
const DOT_RADIUS = 1.05;
const LENS_RADIUS = 180;

export default function DotField({ lines = ['Complex ideas.', 'Simply explained.'] }) {
  const canvasRef = useRef(null);
  const textLines = lines.join('|');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const context = canvas.getContext('2d');
    if (!context) return undefined;

    let animationFrame;
    let width = 0;
    let height = 0;
    let dots = [];
    let textDots = [];
    let pointerTarget = { x: -1000, y: -1000 };
    let pointerPosition = { x: -1000, y: -1000 };
    const renderedLines = textLines.split('|');

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      width = bounds.width;
      height = bounds.height;
      canvas.width = width * pixelRatio;
      canvas.height = height * pixelRatio;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      dots = [];
      for (let y = DOT_SPACING / 2; y < height; y += DOT_SPACING) {
        for (let x = DOT_SPACING / 2; x < width; x += DOT_SPACING) {
          dots.push({ x, y, phase: Math.random() * Math.PI * 2 });
        }
      }

      const textCanvas = document.createElement('canvas');
      textCanvas.width = width;
      textCanvas.height = height;
      const textContext = textCanvas.getContext('2d');
      if (!textContext) return;
      const fontSize = Math.min(92, Math.max(34, width * 0.095));
      textContext.fillStyle = 'white';
      textContext.textAlign = 'center';
      textContext.textBaseline = 'middle';
      textContext.font = `800 ${fontSize}px "Plus Jakarta Sans", sans-serif`;
      const lineHeight = fontSize * 0.95;
      const startY = height * 0.48 - ((renderedLines.length - 1) * lineHeight) / 2;
      renderedLines.forEach((line, index) => {
        textContext.fillText(line, width / 2, startY + index * lineHeight);
      });

      const pixels = textContext.getImageData(0, 0, width, height).data;
      textDots = [];
      for (let y = 0; y < height; y += 7) {
        for (let x = 0; x < width; x += 7) {
          if (pixels[(Math.floor(y) * width + Math.floor(x)) * 4 + 3] > 80) {
            textDots.push({ x, y });
          }
        }
      }
    };

    const draw = (time) => {
      context.clearRect(0, 0, width, height);
      const seconds = time / 1000;
      pointerPosition.x += (pointerTarget.x - pointerPosition.x) * 0.12;
      pointerPosition.y += (pointerTarget.y - pointerPosition.y) * 0.12;

      dots.forEach((dot) => {
        const dx = dot.x - pointerPosition.x;
        const dy = dot.y - pointerPosition.y;
        const distance = Math.hypot(dx, dy);
        const influence = Math.max(0, 1 - distance / LENS_RADIUS);
        const eased = influence * influence;
        const angle = Math.atan2(dy, dx) + eased * 0.7;
        const magnification = 1 + eased * 0.65;
        const x = pointerPosition.x + Math.cos(angle) * distance * magnification;
        const y = pointerPosition.y + Math.sin(angle) * distance * magnification;
        const wave = Math.sin(seconds * 1.1 + dot.phase) * 0.3;
        const radius = DOT_RADIUS + eased * 1.7 + wave;
        const gradientPosition = Math.max(0, Math.min(1, (x + y) / (width + height)));
        const red = Math.round(90 + gradientPosition * 100);
        const blue = Math.round(220 + gradientPosition * 35);
        const opacity = 0.28 + eased * 0.5;

        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fillStyle = `rgba(${red}, 150, ${blue}, ${opacity})`;
        context.fill();
      });

      textDots.forEach((dot) => {
        const dx = dot.x - pointerPosition.x;
        const dy = dot.y - pointerPosition.y;
        const distance = Math.hypot(dx, dy);
        const influence = Math.max(0, 1 - distance / LENS_RADIUS);
        const eased = influence * influence;
        const angle = Math.atan2(dy, dx) + eased * 0.7;
        const magnification = 1 + eased * 0.65;
        const x = pointerPosition.x + Math.cos(angle) * distance * magnification;
        const y = pointerPosition.y + Math.sin(angle) * distance * magnification;

        context.beginPath();
        context.arc(x, y, 1.7 + eased * 1.6, 0, Math.PI * 2);
        context.fillStyle = `rgba(255, 255, 255, ${0.5 + eased * 0.45})`;
        context.fill();
      });

      if (pointerPosition.x > -500) {
        const glow = context.createRadialGradient(
          pointerPosition.x, pointerPosition.y, 0,
          pointerPosition.x, pointerPosition.y, LENS_RADIUS,
        );
        glow.addColorStop(0, 'rgba(125, 211, 252, 0.12)');
        glow.addColorStop(0.55, 'rgba(129, 140, 248, 0.04)');
        glow.addColorStop(1, 'rgba(129, 140, 248, 0)');
        context.fillStyle = glow;
        context.fillRect(
          pointerPosition.x - LENS_RADIUS,
          pointerPosition.y - LENS_RADIUS,
          LENS_RADIUS * 2,
          LENS_RADIUS * 2,
        );
      }

      animationFrame = window.requestAnimationFrame(draw);
    };

    const handlePointerMove = (event) => {
      const bounds = canvas.getBoundingClientRect();
      pointerTarget = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
    };

    const handlePointerLeave = () => {
      pointerTarget = { x: -1000, y: -1000 };
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('blur', handlePointerLeave);
    animationFrame = window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('blur', handlePointerLeave);
    };
  }, [textLines]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="dot-field"
    />
  );
}
