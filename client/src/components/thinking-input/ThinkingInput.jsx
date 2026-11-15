import { useEffect, useLayoutEffect, useRef } from 'react';
import { createOrb, cubicBezier } from './orbRenderer';
import './thinking-input.css';

const ease = {
  out: cubicBezier(.22, 1, .36, 1),
  io: cubicBezier(.65, 0, .35, 1),
  grow: cubicBezier(.3, 0, .2, 1),
  vortex: cubicBezier(.6, 0, .2, 1),
  spring: cubicBezier(.34, 1.4, .64, 1),
  card: cubicBezier(.65, 0, .2, 1),
};
const track = (channel, from, to, start, end, easing = ease.io) =>
  ({ channel, from, to, start, end, easing });
const LABELS = ['Thinking', 'Searching', 'Analyzing', 'Composing'];

// The reference's particle animation and timings, scoped to the existing editor.
function createAnimation(root, actor, content, canvas, status) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const orb = createOrb(canvas, () => 1, () => reduced.matches);
  const resizeObserver = new ResizeObserver(() => {
    root.style.setProperty('--editor-width', `${root.clientWidth}px`);
  });
  resizeObserver.observe(root);
  let controller;
  let labelTimer;
  let complete;
  let destroyed = false;
  let restoreFocus = false;

  const set = (channel, value) => {
    if (channel.startsWith('orb.')) {
      orb.P[channel.slice(4)] = value;
      orb.ensure();
    } else {
      actor.style.setProperty(`--${channel}`, String(value));
    }
  };
  const phase = value => { root.dataset.phase = value; };
  const home = () => {
    orb.reset();
    phase('idle');
    actor.removeAttribute('style');
    content.inert = false;
    status.textContent = '';
    if (restoreFocus && !destroyed) content.querySelector('textarea')?.focus({ preventScroll: true });
    restoreFocus = false;
  };
  const play = (tracks, signal) => new Promise(resolve => {
    if (signal.aborted) return resolve();
    const duration = Math.max(...tracks.map(item => item.end));
    let frame;
    const start = performance.now();
    const finish = () => {
      cancelAnimationFrame(frame);
      signal.removeEventListener('abort', finish);
      resolve();
    };
    const tick = now => {
      const elapsed = now - start;
      for (const item of tracks) {
        if (elapsed < item.start) continue;
        const progress = Math.min(1, (elapsed - item.start) / (item.end - item.start));
        set(item.channel, item.from + (item.to - item.from) * item.easing(progress));
      }
      if (elapsed >= duration) finish();
      else frame = requestAnimationFrame(tick);
    };
    signal.addEventListener('abort', finish, { once: true });
    frame = requestAnimationFrame(tick);
  });

  const run = async signal => {
    const width = root.clientWidth;
    const height = content.offsetHeight;
    restoreFocus = content.contains(document.activeElement);
    root.style.setProperty('--editor-width', `${width}px`);
    root.style.setProperty('--editor-height', `${Math.max(height, 240)}px`);
    content.inert = true;
    orb.reset();
    set('w', width);
    set('h', height);
    phase('launch');
    // Resolve only when the real request finishes; no demo answer or fake timer.
    const response = new Promise(resolve => { complete = resolve; });
    if (reduced.matches) {
      set('oInput', 0);
      set('oPill', 0);
      set('oAur', 0);
      set('oRing', 0);
      set('w', 132);
      set('h', 132);
      set('r', 66);
      set('orb.k', 1);
      set('orb.alpha', 1);
    } else {
      await play([
        track('w', width, width - 12, 0, 100, ease.out),
        track('oInput', 1, 0, 0, 160),
        track('inScale', 1, .6, 0, 160),
        track('oAur', 1, 0, 0, 300, ease.out),
        track('oGlow', 1, 0, 0, 300, ease.out),
        track('w', width - 12, 60, 100, 560),
        track('h', height, 60, 100, 620),
        track('r', 16, 66, 100, 560),
        track('oPill', 0, 1, 0, 160),
        track('oPill', 1, 0, 300, 560, ease.out),
        track('oBall', 0, 1, 300, 560, ease.out),
        track('w', 60, 138, 620, 1300, ease.grow),
        track('h', 60, 138, 620, 1300, ease.grow),
        track('w', 138, 132, 1300, 1500, ease.out),
        track('h', 138, 132, 1300, 1500, ease.out),
      ], signal);
      if (signal.aborted) return;
      phase('assemble');
      await play([
        track('oRing', 1, 0, 0, 300, ease.out),
        track('oBall', 1, 0, 0, 260, ease.out),
        track('orb.k', 0, 1, 0, 800, ease.out),
        track('orb.alpha', 0, 1, 0, 800, ease.out),
        track('orb.spin', 0, .9, 0, 800, ease.out),
        track('orb.pop', 1, 1.05, 0, 420, ease.out),
        track('orb.pop', 1.05, 1, 420, 800),
      ], signal);
    }
    if (signal.aborted) return;
    phase('think');
    let label = 0;
    status.textContent = `${LABELS[0]}…`;
    labelTimer = window.setInterval(() => {
      label = (label + 1) % LABELS.length;
      orb.P.prog = label;
      status.textContent = `${LABELS[label]}…`;
    }, 1150);
    await response;
    window.clearInterval(labelTimer);
    if (signal.aborted) return;
    phase('resolve');
    status.textContent = 'Ready';
    if (!reduced.matches) {
      await play([
        track('orb.sweep', 0, 1, 0, 700),
        track('orb.spin', .9, .3, 0, 700, ease.out),
        track('orb.gain', 1, 0, 0, 700, ease.out),
        track('orb.floor', 0, .95, 400, 900, ease.out),
        track('orb.rad', 0, .15, 400, 900, ease.out),
        track('orb.pop', 1, 1.04, 600, 800, ease.out),
        track('orb.pop', 1.04, 1, 800, 900, ease.out),
      ], signal);
      if (signal.aborted) return;
      phase('condense');
      await play([
        track('orb.pop', 1, 1.06, 0, 120, ease.out),
        track('orb.k', 1, 0, 120, 640, ease.vortex),
        track('orb.vortex', 0, 1.6, 120, 640, ease.vortex),
        track('oGreen', 0, 1, 260, 700, ease.spring),
        track('gs', .55, 1, 260, 700, ease.spring),
        track('pulse', 0, 1, 320, 760, ease.out),
        track('oHalo', 0, .35, 380, 700, ease.out),
        track('orb.alpha', 1, 0, 500, 800, ease.out),
      ], signal);
      if (signal.aborted) return;
      phase('unfold');
      await play([
        track('w', 132, 124, 0, 90),
        track('h', 132, 124, 0, 90),
        track('w', 124, root.clientWidth, 90, 700, ease.card),
        track('h', 124, content.offsetHeight, 90, 700, ease.out),
        track('r', 66, 16, 90, 700),
        track('oGreen', 1, 0, 200, 560, ease.out),
        track('oHalo', .35, 0, 300, 700, ease.out),
        track('oInput', 0, 1, 300, 700, ease.out),
        track('inScale', .96, 1, 300, 700, ease.out),
        track('oAur', 0, 1, 300, 700, ease.out),
        track('oRing', 0, 1, 300, 700, ease.out),
        track('oGlow', 0, 1, 300, 700, ease.out),
      ], signal);
    }
    if (!signal.aborted) {
      complete = undefined;
      controller = undefined;
      home();
    }
  };

  return {
    setLoading(loading) {
      if (!loading) { complete?.(); return; }
      controller?.abort();
      complete?.();
      window.clearInterval(labelTimer);
      home();
      controller = new AbortController();
      void run(controller.signal);
    },
    destroy() {
      destroyed = true;
      resizeObserver.disconnect();
      controller?.abort();
      complete?.();
      window.clearInterval(labelTimer);
      orb.destroy();
      home();
    },
  };
}

export default function ThinkingInput({ loading, children }) {
  const rootRef = useRef(null);
  const actorRef = useRef(null);
  const contentRef = useRef(null);
  const canvasRef = useRef(null);
  const statusRef = useRef(null);
  const animationRef = useRef(null);

  useLayoutEffect(() => {
    const animation = createAnimation(rootRef.current, actorRef.current, contentRef.current, canvasRef.current, statusRef.current);
    animationRef.current = animation;
    return () => { animation.destroy(); animationRef.current = null; };
  }, []);

  useEffect(() => { animationRef.current?.setLoading(loading); }, [loading]);

  return (
    <div ref={rootRef} className="thinking-input" data-phase="idle" aria-busy={loading}>
      <div ref={actorRef} className="thinking-input__actor">
        <div className="thinking-input__underglow" aria-hidden="true" />
        <div className="thinking-input__halo" aria-hidden="true" />
        <div className="thinking-input__surface" aria-hidden="true" />
        <div className="thinking-input__aurora" aria-hidden="true"><i /><i /><i /><i /></div>
        <div className="thinking-input__ball" aria-hidden="true" />
        <div className="thinking-input__green" aria-hidden="true" />
        <div ref={contentRef} className="thinking-input__content">{children}</div>
        <div className="thinking-input__ring" aria-hidden="true" />
        <canvas ref={canvasRef} className="thinking-input__orb" aria-hidden="true" />
        <div className="thinking-input__pulse" aria-hidden="true" />
      </div>
      <div ref={statusRef} className="thinking-input__status" role="status" aria-live="polite" />
    </div>
  );
}
