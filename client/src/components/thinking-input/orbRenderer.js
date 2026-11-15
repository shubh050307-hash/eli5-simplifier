// Particle renderer adapted from anark17r's MIT-licensed 21st.dev preview.
// https://21st.dev/@anark17r/components/ai-thiking-orb-and-input

const clamp01 = value => Math.max(0, Math.min(1, value));
const lerp = (from, to, progress) => from + (to - from) * progress;
const TAU = Math.PI * 2,
  ORB_RADIUS = 66,
  CANVAS_SIZE = 220;
function seededRandom(d) {
  return function () {
    d |= 0, d = d + 1831565813 | 0;
    let _ = Math.imul(d ^ d >>> 15, 1 | d);
    return _ = _ + Math.imul(_ ^ _ >>> 7, 61 | _) ^ _, ((_ ^ _ >>> 14) >>> 0) / 4294967296;
  };
}
function cubicBezier(d, _, U, o) {
  const R = 3 * d,
    N = 3 * (U - d) - R,
    Z = 1 - R - N,
    tt = 3 * _,
    q = 3 * (o - _) - tt,
    b = 1 - tt - q,
    G = V => ((Z * V + N) * V + R) * V,
    K = V => ((b * V + q) * V + tt) * V,
    I = V => (3 * Z * V + 2 * N) * V + R,
    P = V => {
      let st = V;
      for (let Ot = 0; Ot < 8; Ot++) {
        const yt = G(st) - V;
        if (Math.abs(yt) < 1e-6) return st;
        const Ut = I(st);
        if (Math.abs(Ut) < 1e-6) break;
        st -= yt / Ut;
      }
      let ot = 0,
        Dt = 1;
      st = V;
      for (let Ot = 0; Ot < 40; Ot++) {
        const yt = G(st);
        if (Math.abs(yt - V) < 1e-6) break;
        V > yt ? ot = st : Dt = st, st = (Dt - ot) / 2 + ot;
      }
      return st;
    };
  return V => V <= 0 ? 0 : V >= 1 ? 1 : K(P(V));
}
const easing = {
  out: cubicBezier(.22, 1, .36, 1)
};
const LATITUDE_ROWS = 16,
  particles = (() => {
    const d = seededRandom(7),
      _ = [];
    for (let U = 0; U < LATITUDE_ROWS; U++) {
      const o = 1 - (U + .5) / LATITUDE_ROWS * 2,
        R = Math.sqrt(1 - o * o),
        N = Math.max(4, Math.round(30 * R));
      for (let Z = 0; Z < N; Z++) {
        const tt = Z / N * TAU + U * .35;
        _.push({
          x: Math.cos(tt) * R,
          y: o,
          z: Math.sin(tt) * R,
          u: (1 - o) / 2,
          seed: d() * 6.283
        });
      }
    }
    return _;
  })(),
  particleCount = particles.length,
  particleX = Float32Array.from(particles, d => d.x),
  particleY = Float32Array.from(particles, d => d.y),
  particleZ = Float32Array.from(particles, d => d.z),
  particleLatitude = Float32Array.from(particles, d => d.u),
  particleSeed = Float32Array.from(particles, d => d.seed),
  COLOR_STEPS = 24,
  ALPHA_STEPS = 48,
  palette = (() => {
    const d = [];
    for (let _ = 0; _ <= COLOR_STEPS; _++) {
      const U = _ / COLOR_STEPS,
        o = Math.round(lerp(235, 52, U)),
        R = Math.round(lerp(235, 211, U)),
        N = Math.round(lerp(235, 153, U));
      for (let Z = 0; Z <= ALPHA_STEPS; Z++) d.push(`rgba(${o},${R},${N},${(Z / ALPHA_STEPS).toFixed(3)})`);
    }
    return d;
  })();
function createOrb(d, _, U) {
  const o = {
      k: 0,
      alpha: 0,
      spin: 0,
      rot: 0,
      sweep: 0,
      pop: 1,
      vortex: 0,
      gain: 1,
      floor: 0,
      rad: 0,
      prog: 0
    },
    R = d.getContext("2d"),
    N = new Float32Array(particleCount),
    Z = new Float32Array(particleCount),
    tt = new Float32Array(particleCount),
    q = new Float32Array(particleCount),
    b = new Float32Array(particleCount),
    G = new Int16Array(particleCount),
    K = [1, 0, 0, 0];
  let I = 0,
    P = 0,
    V = 0,
    st = !1;
  const ot = () => {
    o.k = 0, o.alpha = 0, o.spin = 0, o.rot = 0, o.sweep = 0, o.pop = 1, o.vortex = 0, o.gain = 1, o.floor = 0, o.rad = 0, o.prog = 0, N.fill(0), K[0] = 1, K[1] = 0, K[2] = 0, K[3] = 0, I = U() ? 1.2 : 0;
  };
  if (ot(), !R) return {
    P: o,
    ensure() {},
    reset: ot,
    destroy() {}
  };
  const Dt = Math.min(2, window.devicePixelRatio || 1);
  d.width = Math.round(CANVAS_SIZE * Dt), d.height = Math.round(CANVAS_SIZE * Dt), R.setTransform(Dt, 0, 0, Dt, 0, 0);
  const Ot = .6,
    yt = Math.cos(.35),
    Ut = Math.sin(.35),
    lt = CANVAS_SIZE / 2,
    jt = St => {
      R.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE), I += St, o.rot += o.spin * St;
      const Xt = o.rot + o.vortex,
        Et = Math.cos(Xt),
        il = Math.sin(Xt),
        Ht = St / .35;
      for (let J = 0; J < 4; J++) {
        const et = (J === o.prog ? 1 : 0) - K[J];
        K[J] += Math.abs(et) <= Ht ? et : et > 0 ? Ht : -Ht;
      }
      const Zt = Math.exp(-St / .5),
        E = I * 300 % particleCount,
        B = I * 480 % particleCount,
        Y = I * .8,
        nt = Math.sin(I * .5) * .9,
        r = Math.cos(nt) * Math.cos(Y),
        z = Math.sin(nt),
        j = Math.cos(nt) * Math.sin(Y),
        x = I * .55 + 2.1,
        L = Math.cos(I * .42) * .9,
        O = Math.cos(L) * Math.cos(x),
        T = Math.sin(L),
        C = Math.cos(L) * Math.sin(x),
        W = Math.sin(I * 2.2),
        rt = o.vortex * 1.5;
      for (let J = 0; J < particleCount; J++) {
        const et = particleX[J],
          _t = particleY[J],
          qt = particleZ[J],
          Bt = particleLatitude[J];
        let Lt = 0;
        if (K[0] > .001) {
          let Kt = Math.abs(J - E);
          Kt > particleCount - Kt && (Kt = particleCount - Kt);
          const el = Math.max(0, 1 - Kt / 16);
          Lt = Math.max(Lt, el * el * K[0]);
        }
        if (K[1] > .001) {
          const Kt = Math.max(0, (et * r + _t * z + qt * j - .72) / .28),
            el = Math.max(0, (et * O + _t * T + qt * C - .72) / .28),
            Jl = Math.max(Kt, el);
          Lt = Math.max(Lt, Jl * Jl * K[1]);
        }
        if (K[2] > .001) {
          const Kt = _t - W,
            el = Math.max(0, 1 - Kt * Kt / .02);
          Lt = Math.max(Lt, el * el * K[2]);
        }
        if (K[3] > .001) {
          let Kt = Math.abs(J - B);
          Kt > particleCount - Kt && (Kt = particleCount - Kt);
          const el = Math.max(0, 1 - Kt / 22);
          Lt = Math.max(Lt, el * el * K[3]);
        }
        const Wt = Math.max(N[J] * Zt, Lt * o.gain);
        N[J] = Wt;
        const Nt = clamp01(o.k * (1 + Ot) - Ot * Bt);
        if (Nt <= .001) {
          G[J] = -1;
          continue;
        }
        const $t = easing.out(Nt),
          Zl = $t * o.pop,
          mt = et * Et + qt * il,
          Nl = -et * il + qt * Et,
          hc = _t * yt - Nl * Ut,
          Ke = _t * Ut + Nl * yt,
          Je = 2.8 / (2.8 - Ke),
          ma = (Ke + 1) / 2;
        let Kl = mt * ORB_RADIUS * Zl * Je,
          al = -hc * ORB_RADIUS * Zl * Je;
        if (rt > .001) {
          const Kt = (1 - Nt) * rt,
            el = Math.cos(Kt),
            Jl = Math.sin(Kt),
            Il = Kl * el - al * Jl;
          al = Kl * Jl + al * el, Kl = Il;
        }
        const hl = clamp01((o.sweep * 1.4 - Bt) / .4);
        let Ft = .1 + .035 * Math.sin(particleSeed[J] + I * 1.6) * (1 - hl) + .32 * ma * ma + .75 * Wt * (1 - hl) + hl * (.55 + .4 * ma) + 2 * hl * (1 - hl);
        Ft = Math.max(Ft, o.floor * (.7 + .3 * ma)), Ft > 1 && (Ft = 1), Ft *= $t * o.alpha, Z[J] = lt + Kl, tt[J] = lt + al, b[J] = ma, q[J] = (1.15 * (.45 + .75 * ma) * Je + .9 * Wt + hl * .25) * (1 + o.rad) * (.4 + .6 * $t);
        const Fu = Math.round(Ft * ALPHA_STEPS),
          yc = Math.round(hl * COLOR_STEPS);
        G[J] = Fu <= 0 ? -1 : yc * (ALPHA_STEPS + 1) + Fu;
      }
      for (let J = 0; J < 2; J++) for (let et = 0; et < particleCount; et++) {
        const _t = G[et];
        _t < 0 || b[et] >= .5 == (J === 1) && (R.fillStyle = palette[_t], R.beginPath(), R.arc(Z[et], tt[et], q[et], 0, TAU), R.fill());
      }
    },
    Gt = St => {
      if (P = 0, st) return;
      const Xt = U() ? 0 : Math.max(0, Math.min(.05, (St - V) / 1e3)) * _();
      V = St, jt(Xt), o.alpha > .002 ? P = requestAnimationFrame(Gt) : R.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    };
  return {
    P: o,
    ensure: () => {
      P || st || o.alpha <= .002 || (V = performance.now(), P = requestAnimationFrame(Gt));
    },
    reset: ot,
    destroy: () => {
      st = !0, P && cancelAnimationFrame(P), P = 0;
    }
  };
}
export { createOrb, cubicBezier };
