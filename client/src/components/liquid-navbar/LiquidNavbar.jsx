// Adapted from Guglielmo Giannattasio's MIT-licensed Liquid Glass Navbar.
// https://21st.dev/@gughigug/components/liquid-glass-navbar
// Original water-drop physics, signed-distance shader, and icon motion retained.
import * as React from "react";
import * as jsxRuntime from "react/jsx-runtime";
const CANVAS_PADDING = 14,
  LIQUID_NAV_CSS = `
.nimbus-nav{--n-tint:rgba(255,255,255,.14);--n-fg:#0B132B;--n-fg-soft:rgba(11,19,43,.6);--n-rim:rgba(255,255,255,.7);
  position:relative;display:inline-flex;align-items:center;gap:2px;padding:6px;border-radius:999px;isolation:isolate;
  font-family:ui-sans-serif,-apple-system,"SF Pro Text","Segoe UI",system-ui,sans-serif;-webkit-font-smoothing:antialiased;user-select:none;-webkit-tap-highlight-color:transparent}
.nimbus-nav[data-tone="dark"]{--n-tint:rgba(10,18,40,.26);--n-fg:#F1F7FF;--n-fg-soft:rgba(241,247,255,.66);--n-rim:rgba(255,255,255,.34)}
.nimbus-glass{position:absolute;inset:0;border-radius:inherit;z-index:-2;overflow:hidden;background:var(--n-tint);
  -webkit-backdrop-filter:blur(10px) saturate(1.2) brightness(1.08);backdrop-filter:blur(10px) saturate(1.2) brightness(1.08);
  box-shadow:inset 0 1px 1px var(--n-rim),inset 0 0 0 1px rgba(255,255,255,.2),0 12px 32px -14px rgba(0,40,90,.5),0 2px 6px rgba(0,40,90,.1)}
.nimbus-nav[data-refract="on"] .nimbus-glass{-webkit-backdrop-filter:url(#nimbus-refract) blur(2px) saturate(1.2) brightness(1.08);backdrop-filter:url(#nimbus-refract) blur(2px) saturate(1.2) brightness(1.08)}
.nimbus-water{position:absolute;left:${-CANVAS_PADDING}px;top:${-CANVAS_PADDING}px;z-index:-1;pointer-events:none}
.nimbus-nav[data-gl="off"] .nimbus-water{display:none}
.nimbus-drop{display:none;position:absolute;top:6px;bottom:6px;left:0;border-radius:999px;z-index:-1;pointer-events:none;will-change:transform,width;
  background:radial-gradient(120% 140% at 30% 0%,rgba(255,255,255,.75),rgba(255,255,255,0) 55%),rgba(255,255,255,.38);
  box-shadow:inset 0 1px 1px rgba(255,255,255,.95),inset 0 -2px 6px rgba(0,162,255,.22),inset 0 0 0 1px rgba(255,255,255,.55),0 6px 16px -6px rgba(0,70,140,.45)}
.nimbus-nav[data-gl="off"] .nimbus-drop{display:block}
.nimbus-item{position:relative;z-index:1;display:inline-flex;align-items:center;gap:8px;height:42px;padding:0 16px;border:0;border-radius:999px;background:none;color:var(--n-fg-soft);
  font-family:inherit;font-weight:500;font-size:14px;line-height:1;letter-spacing:-.01em;text-decoration:none;cursor:pointer;transition:color .25s}
.nimbus-item:hover,.nimbus-item[data-active="true"]{color:var(--n-fg)}
.nimbus-item:focus-visible{outline:2px solid #00A2FF;outline-offset:2px}
.nv-ico{position:relative;display:inline-flex;flex:none}
.nv-ico svg{transition:transform .45s cubic-bezier(.3,1.6,.5,1)}
.nimbus-item[data-active="true"] .nv-ico svg{transform:translateY(-1px) scale(1.08)}
.nv-door{fill:transparent}
.nv-ico[data-fx="pop"] svg{animation:nvPop .5s cubic-bezier(.3,1.6,.5,1) both}
@keyframes nvPop{0%{transform:scale(.72)}60%{transform:scale(1.2)}100%{transform:translateY(-1px) scale(1.08)}}
.nv-ico[data-fx="plane"] svg{animation:nvPlane 1.15s cubic-bezier(.55,0,.3,1) both}
@keyframes nvPlane{0%{transform:none}12%{transform:translate(-3px,2px) rotate(7deg)}42%{transform:translate(64px,-26px) rotate(-24deg) scale(.9);opacity:0}43%{transform:translate(-60px,16px) rotate(-12deg) scale(.9);opacity:0}58%{opacity:1}80%{transform:translate(3px,-1px) rotate(2deg)}100%{transform:translateY(-1px) scale(1.08)}}
.nv-ico[data-fx="plane"]::after{content:"";position:absolute;left:55%;top:48%;height:2px;width:46px;border-radius:2px;transform-origin:0 50%;
  background:linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,.95));animation:nvTrail 1.15s ease-out both;pointer-events:none}
@keyframes nvTrail{0%,8%{opacity:0;transform:rotate(-22deg) scaleX(0)}30%{opacity:.9;transform:rotate(-22deg) scaleX(1)}55%,100%{opacity:0;transform:rotate(-22deg) translateX(30px) scaleX(.2)}}
.nv-ico[data-fx="drop"] svg{animation:nvDrop .95s cubic-bezier(.4,0,.3,1) both;transform-origin:50% 100%}
@keyframes nvDrop{0%{transform:translateY(-1px)}26%{transform:translateY(-13px) scale(.88,1.12)}46%{transform:translateY(3px) scale(1.3,.68)}62%{transform:translateY(-3px) scale(.92,1.08)}80%{transform:translateY(0) scale(1.04,.97)}100%{transform:translateY(-1px) scale(1.08)}}
.nv-ico[data-fx="drop"]::before,.nv-ico[data-fx="drop"]::after{content:"";position:absolute;bottom:0;left:50%;width:4px;height:4px;margin-left:-2px;border-radius:50%;background:currentColor;opacity:0;pointer-events:none}
.nv-ico[data-fx="drop"]::before{animation:nvSplashL .95s ease-out both}
.nv-ico[data-fx="drop"]::after{animation:nvSplashR .95s ease-out both}
@keyframes nvSplashL{0%,44%{opacity:0;transform:none}50%{opacity:.9;transform:translate(-5px,-6px)}75%,100%{opacity:0;transform:translate(-11px,1px) scale(.4)}}
@keyframes nvSplashR{0%,44%{opacity:0;transform:none}50%{opacity:.9;transform:translate(5px,-7px)}75%,100%{opacity:0;transform:translate(12px,1px) scale(.4)}}
.nv-ico[data-fx="spin"] svg{animation:nvSpin 1s cubic-bezier(.2,.75,.25,1) both}
@keyframes nvSpin{0%{transform:perspective(80px) rotateY(0)}100%{transform:perspective(80px) rotateY(360deg) translateY(-1px) scale(1.08)}}
.nv-ico[data-fx="glow"] svg{animation:nvHop .8s cubic-bezier(.3,1.4,.5,1) both;transform-origin:50% 100%}
@keyframes nvHop{0%{transform:none}30%{transform:translateY(-5px) scale(1.04,.96)}55%{transform:translateY(0) scale(1.12,.88)}75%{transform:translateY(-2px) scale(.98,1.04)}100%{transform:translateY(-1px) scale(1.08)}}
.nv-ico[data-fx="glow"] .nv-door{animation:nvDoor 1.3s ease both}
@keyframes nvDoor{0%{fill:transparent}30%{fill:#FFF3A8}100%{fill:rgba(126,232,255,.6)}}
.nv-ico[data-fx="wave"] svg{animation:nvWave .9s ease-in-out both;transform-origin:50% 92%}
@keyframes nvWave{0%{transform:none}20%{transform:rotate(-15deg)}40%{transform:rotate(12deg)}60%{transform:rotate(-8deg)}80%{transform:rotate(4deg)}100%{transform:translateY(-1px) scale(1.08)}}
.nimbus-nav[data-compact="true"] .nimbus-item{padding:0 13px}
.nimbus-nav[data-compact="true"] .nimbus-label{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
@media (max-width:520px){.nimbus-nav:not([data-compact="false"]) .nimbus-item{padding:0 13px}.nimbus-nav:not([data-compact="false"]) .nimbus-label{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}}
@media (prefers-reduced-motion:reduce){.nv-ico svg,.nv-ico::before,.nv-ico::after,.nv-door{animation:none!important;transition:none}}
`,
  VERTEX_SHADER = "attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}",
  FRAGMENT_SHADER = `precision highp float;
uniform vec2 uRes;uniform float uDpr;uniform float uTime;uniform vec4 uPill;
uniform vec4 uBlob[6];uniform float uSy[6];uniform vec4 uRip[6];uniform vec3 uMouse;uniform float uDark;uniform float uAmb;
float sdRB(vec2 p,vec2 b,float r){vec2 q=abs(p)-b+r;return length(max(q,0.))+min(max(q.x,q.y),0.)-r;}
float sdCap(vec2 p,vec4 B,float sy){p-=B.xy;p.y/=sy;p.x=max(abs(p.x)-B.z,0.);return(length(p)-B.w)*min(1.,sy);}
float smin(float a,float b,float k){float h=clamp(.5+.5*(b-a)/k,0.,1.);return mix(b,a,h)-k*h*(1.-h);}
float dropD(vec2 p){float d=1e4;for(int i=0;i<6;i++){if(uBlob[i].w>.5){d=smin(d,sdCap(p,uBlob[i],uSy[i]),13.);}}return d;}
float pillD(vec2 p){vec2 h=uPill.zw*.5;return sdRB(p-uPill.xy-h,h,h.y);}
float lens(float d,float w){float t=clamp(-d/w,0.,1.);return sqrt(1.-(1.-t)*(1.-t));}
float waves(vec2 p){float w=0.;
 for(int i=0;i<6;i++){vec4 R=uRip[i];if(R.w>0.){float x=length(p-R.xy)-R.z*240.;w+=R.w*exp(-R.z*1.7)*sin(x*.3)*exp(-x*x/700.);}}
 vec2 m=p-uMouse.xy;w+=uMouse.z*3.6*exp(-dot(m,m)/1000.);
 w+=uAmb*(sin(p.x*.05+uTime*1.2)*.45+sin(p.x*.13-uTime*.85+p.y*.2)*.25);return w;}
float H(vec2 p){float dp=pillD(p);return lens(dp,uPill.w*.36)*2.4+lens(dropD(p),11.)*7.5+waves(p)*smoothstep(0.,7.,-dp);}
float caus(vec2 p,float t){vec2 q=p;float c=0.;for(int i=0;i<3;i++){q+=vec2(sin(q.y*1.1+t),cos(q.x*1.3-t*.7))*.6;c+=1./(1.+16.*abs(sin(q.x)*sin(q.y)));}return c/3.;}
void main(){
 vec2 p=vec2(gl_FragCoord.x,uRes.y*uDpr-gl_FragCoord.y)/uDpr;
 float dp=pillD(p);float dd=dropD(p);
 float h0=H(p);vec3 n=normalize(vec3(h0-H(p+vec2(1.,0.)),h0-H(p+vec2(0.,1.)),1.));
 vec3 V=vec3(0.,0.,1.);
 float spec=pow(max(dot(reflect(-normalize(vec3(-.45,-.8,.85)),n),V),0.),70.);
 float spec2=pow(max(dot(reflect(-normalize(vec3(.6,.75,.7)),n),V),0.),22.)*.3;
 float fres=clamp((1.-n.z)*4.,0.,1.);
 vec3 irid=.5+.5*cos(6.2831*(vec3(0.,.33,.67)+fres*.85+p.x*.0028+uTime*.035));
 float pm=smoothstep(1.,-1.,dp);float dm=smoothstep(1.,-1.,dd)*smoothstep(1.,-2.,dp);
 float sh=smoothstep(9.,-9.,dropD(p-vec2(0.,5.)))*(1.-dm)*pm*(.11+.07*uDark);
 vec3 c=vec3(0.,.14,.36)*sh;float a=sh;
 float pa=clamp(pm*(fres*.5+spec*.9+spec2),0.,1.);
 c=mix(vec3(1.),irid,.5*fres)*pa+c*(1.-pa);a=pa+a*(1.-pa);
 float th=lens(dd,11.);
 float cs=caus((p+n.xy*th*18.)*.085,uTime*.9);
 vec3 tint=mix(vec3(.98,.95,.88),vec3(.78,.76,.72),uDark);
 float rim=dm*(1.-smoothstep(0.,8.,-dd));
 float cres=dm*smoothstep(.12,.55,dot(n.xy,normalize(vec2(.55,.85))))*smoothstep(0.,3.,-dd);
 float body=.5+.5*clamp(-n.y*3.,-1.,1.);
 float da=dm*(.26+.14*body)*(1.-.35*uDark);vec3 dc=mix(tint,vec3(1.),body*.6);
 float la=rim*.22;vec3 lc=mix(vec3(.48,.43,.34),vec3(.65,.59,.47),uDark);dc=lc*la+dc*da*(1.-la);da=la+da*(1.-la);
 la=clamp(cres*.7+smoothstep(.6,1.,cs)*.28*th*dm,0.,1.);dc=vec3(1.)*la+dc*(1.-la);da=la+da*(1.-la);
 la=clamp(dm*(spec*1.2+spec2*.5),0.,1.);dc=vec3(1.)*la+dc*(1.-la);da=la+da*(1.-la);
 la=dm*smoothstep(-2.,0.,dd)*.4;dc=mix(vec3(1.),irid,.35)*la+dc*(1.-la);da=la+da*(1.-la);
 c=dc+c*(1.-da);a=da+a*(1.-da);
 gl_FragColor=vec4(c,a);
}`;
function createWaterState() {
  return {
    a: {
      x: 0,
      v: 0
    },
    b: {
      x: 0,
      v: 0
    },
    sy: {
      s: 1,
      v: 0
    },
    lead: 0,
    lagFrom: 0,
    sats: [],
    rips: [],
    t: {
      x: 0,
      cy: 0,
      q: 0,
      r: 21
    },
    q: 0,
    mouse: {
      x: 0,
      y: 0,
      s: 0,
      on: !1
    },
    moving: !1,
    split: !1,
    ready: !1,
    w: 0,
    h: 0,
    visible: !0,
    reduce: !1,
    raf: 0,
    last: 0,
    time: 0,
    glc: null
  };
}
function createWaterRenderer(D) {
  const O = D.getContext("webgl", {
    premultipliedAlpha: !0,
    alpha: !0,
    antialias: !1
  });
  if (!O) return null;
  const V = (x, B) => {
      const I = O.createShader(x);
      O.shaderSource(I, B);
      O.compileShader(I);
      if (O.getShaderParameter(I, O.COMPILE_STATUS)) return I;
      O.deleteShader(I);
      return null;
    },
    m = V(O.VERTEX_SHADER, VERTEX_SHADER),
    j = V(O.FRAGMENT_SHADER, FRAGMENT_SHADER);
  if (!m || !j) {
    if (m) O.deleteShader(m);
    if (j) O.deleteShader(j);
    return null;
  }
  const Y = O.createProgram();
  if (O.attachShader(Y, m), O.attachShader(Y, j), O.linkProgram(Y), !O.getProgramParameter(Y, O.LINK_STATUS)) {
    O.deleteProgram(Y);
    O.deleteShader(m);
    O.deleteShader(j);
    return null;
  }
  O.useProgram(Y);
  const k = O.createBuffer();
  O.bindBuffer(O.ARRAY_BUFFER, k), O.bufferData(O.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), O.STATIC_DRAW);
  const ml = O.getAttribLocation(Y, "a");
  O.enableVertexAttribArray(ml), O.vertexAttribPointer(ml, 2, O.FLOAT, !1, 0, 0);
  const H = {};
  for (const x of ["uRes", "uDpr", "uTime", "uPill", "uBlob", "uSy", "uRip", "uMouse", "uDark", "uAmb"]) H[x] = O.getUniformLocation(Y, x);
  return {
    gl: O,
    u: H,
    destroy() {
      O.deleteBuffer(k);
      O.deleteProgram(Y);
      O.deleteShader(m);
      O.deleteShader(j);
    }
  };
}
function supportsRefraction() {
  var O;
  if (typeof window > "u" || typeof CSS > "u") return !1;
  const D = navigator.userAgent;
  return /Chrome\/|Chromium\/|Edg\//.test(D) && !/Firefox\//.test(D) && !!((O = CSS.supports) != null && O.call(CSS, "backdrop-filter", "url(#a)"));
}
function LiquidNavbar({
  items = [],
  defaultActive = 0,
  active: active,
  onChange: onChange,
  tone = "light",
  compact: compact,
  sound = !1,
  className: className,
  style: style
}) {
  const [selected, setSelected] = React.useState(defaultActive),
    selectedIndex = active ?? selected,
    navRef = React.useRef(null),
    canvasRef = React.useRef(null),
    fallbackRef = React.useRef(null),
    itemRefs = React.useRef([]),
    iconRefs = React.useRef([]),
    audioRef = React.useRef(null),
    waterRef = React.useRef(createWaterState()),
    [glStatus, setGlStatus] = React.useState("on"),
    [refract, setRefract] = React.useState(!1),
    [iconAnimation, setIconAnimation] = React.useState({
      i: -1,
      n: 0
    }),
    darkTone = tone === "dark" ? 1 : 0,
    toneRef = React.useRef(darkTone);
  toneRef.current = darkTone;
  const drawWater = React.useCallback(() => {
      const d = waterRef.current,
        A = d.t,
        b = Math.abs(d.a.x - d.b.x),
        z = Math.min(b / (2 * (d.q + A.r) || 1), 1),
        w = A.r * (1 - .3 * z);
      if (d.glc) {
        const {
            gl: N,
            u: ll
          } = d.glc,
          Fl = Math.min(window.devicePixelRatio || 1, 2);
        N.viewport(0, 0, N.drawingBufferWidth, N.drawingBufferHeight), N.uniform2f(ll.uRes, d.w + CANVAS_PADDING * 2, d.h + CANVAS_PADDING * 2), N.uniform1f(ll.uDpr, Fl), N.uniform1f(ll.uTime, d.time), N.uniform4f(ll.uPill, CANVAS_PADDING, CANVAS_PADDING, d.w, d.h);
        const lt = new Float32Array(24),
          Ut = new Float32Array(6).fill(1),
          Ma = d.lead === 0 ? d.a : d.b,
          L = d.lead === 0 ? d.b : d.a;
        lt.set([Ma.x, A.cy, d.q * (1 - .25 * z), A.r * (1 - .12 * z), L.x, A.cy, d.q * (1 - .8 * z), A.r * (1 - .5 * z)], 0), Ut[0] = Ut[1] = d.sy.s, d.sats.slice(0, 4).forEach((Ll, Nl) => lt.set([Ll.x, Ll.y, 0, Ll.r], 8 + Nl * 4)), N.uniform4fv(ll.uBlob, lt), N.uniform1fv(ll.uSy, Ut);
        const Xt = new Float32Array(24);
        d.rips.slice(-6).forEach((Ll, Nl) => Xt.set([Ll.x, Ll.y, Ll.age, Ll.amp], Nl * 4)), N.uniform4fv(ll.uRip, Xt), N.uniform3f(ll.uMouse, d.mouse.x, d.mouse.y, d.mouse.s), N.uniform1f(ll.uDark, toneRef.current), N.uniform1f(ll.uAmb, d.reduce ? 0 : 1), N.clearColor(0, 0, 0, 0), N.clear(N.COLOR_BUFFER_BIT), N.drawArrays(N.TRIANGLES, 0, 3);
      } else if (fallbackRef.current) {
        const N = Math.min(d.a.x, d.b.x) - d.q - w - CANVAS_PADDING,
          ll = b + 2 * (d.q + w);
        fallbackRef.current.style.width = `${ll}px`, fallbackRef.current.style.transform = `translateX(${N}px) scaleY(${d.sy.s})`;
      }
    }, []),
    stepPhysics = React.useCallback((d, A) => {
      const b = waterRef.current,
        z = b.t;
      b.time += d, b.q += (z.q - b.q) * Math.min(1, d * 12);
      const w = [b.a, b.b];
      let N = !0;
      if (b.reduce) b.a.x = b.b.x = z.x, b.a.v = b.b.v = 0, b.sy.s = 1, b.sats = [];else {
        w.forEach((L, Xt) => {
          const Ll = Xt === b.lead,
            Nl = Ll ? 210 : 72,
            wn = Ll ? 25 : 13,
            Uu = !Ll && A < b.lagFrom ? .08 : 1;
          L.v += (Nl * (z.x - L.x) - wn * L.v) * d * Uu, L.x += L.v * d;
          const Re = CANVAS_PADDING + 6 + b.q + z.r - 3,
            za = CANVAS_PADDING + b.w - 6 - b.q - z.r + 3;
          (L.x < Re || L.x > za) && (b.sy.v -= Math.min(Math.abs(L.v), 900) * .0016, L.x = Math.max(Re, Math.min(za, L.x)), L.v *= -.25), (Math.abs(z.x - L.x) > .3 || Math.abs(L.v) > 3) && (N = !1);
        });
        const Fl = w[b.lead],
          lt = 1 - .2 * Math.min(Math.abs(Fl.v) / 1500, 1);
        b.sy.v += (280 * (lt - b.sy.s) - 9 * b.sy.v) * d, b.sy.s += b.sy.v * d, (Math.abs(b.sy.s - 1) > .002 || Math.abs(b.sy.v) > .02) && (N = !1);
        const Ut = Math.abs(b.a.x - b.b.x),
          Ma = z.r * (1 - .3 * Math.min(Ut / (2 * (z.q + z.r) || 1), 1));
        if (!b.split && b.moving && Ut - 2 * z.q - 2 * Ma > -6) {
          b.split = !0;
          const L = w[1 - b.lead],
            Xt = w[b.lead];
          [.3, .5, .72].forEach((Ll, Nl) => {
            b.sats.push({
              x: L.x + (Xt.x - L.x) * Ll + (Math.random() - .5) * 6,
              y: z.cy + (Math.random() - .5) * 10,
              vx: (L.v + Xt.v) * .45,
              vy: (Math.random() - .5) * 60,
              r: 5 + Math.random() * 3 - Nl * .5,
              k: 70 + Math.random() * 90
            });
          });
        }
        b.sats = b.sats.filter(L => (L.vx += (L.k * (z.x - L.x) - 9 * L.vx) * d, L.vy += (90 * (z.cy - L.y) - 7 * L.vy) * d, L.x += L.vx * d, L.y += L.vy * d, L.x = Math.max(CANVAS_PADDING + 8 + L.r, Math.min(CANVAS_PADDING + b.w - 8 - L.r, L.x)), L.y = Math.max(z.cy - z.r + L.r, Math.min(z.cy + z.r - L.r, L.y)), Math.abs(z.x - L.x) < z.q + z.r * .5 && (L.r -= d * 26), L.r > .6)), b.sats.length && (N = !1);
      }
      b.moving && N && (b.moving = !1, (b.split || !b.reduce) && b.rips.push({
        x: z.x,
        y: z.cy,
        age: 0,
        amp: b.split ? 1.2 : .7
      })), b.rips.forEach(Fl => Fl.age += d), b.rips = b.rips.filter(Fl => Fl.age < 2.4);
      const ll = b.mouse.on ? 1 : 0;
      b.mouse.s += (ll - b.mouse.s) * Math.min(1, d * 7);
    }, []),
    ensureFrame = React.useCallback(() => {
      const d = waterRef.current;
      if (d.raf) return;
      d.last = performance.now();
      const A = b => {
        const z = Math.min((b - d.last) / 1e3, .03333333333333333);
        d.last = b, stepPhysics(z, b), drawWater();
        const w = d.moving || d.rips.length || d.sats.length || d.mouse.s > .01;
        d.visible && (!d.reduce || w) ? d.raf = requestAnimationFrame(A) : d.raf = 0;
      };
      d.raf = requestAnimationFrame(A);
    }, [drawWater, stepPhysics]),
    measure = React.useCallback(() => {
      const d = navRef.current,
        A = itemRefs.current[selectedIndex];
      if (!d || !A) return;
      const b = waterRef.current;
      b.w = d.offsetWidth, b.h = d.offsetHeight;
      const z = b.t;
      z.r = A.offsetHeight / 2, z.q = Math.max(0, A.offsetWidth / 2 - z.r), z.cy = CANVAS_PADDING + A.offsetTop + A.offsetHeight / 2;
      const w = CANVAS_PADDING + A.offsetLeft + A.offsetWidth / 2;
      b.ready ? Math.abs(w - z.x) > .5 && (b.lead = Math.abs(w - b.a.x) <= Math.abs(w - b.b.x) ? 0 : 1, b.lagFrom = performance.now() + 70, b.moving = !0, b.split = !1) : (b.a.x = b.b.x = w, b.q = z.q, b.ready = !0), z.x = w;
      const N = canvasRef.current;
      if (N) {
        const ll = Math.min(window.devicePixelRatio || 1, 2),
          Fl = b.w + CANVAS_PADDING * 2,
          lt = b.h + CANVAS_PADDING * 2;
        (N.width !== Math.round(Fl * ll) || N.height !== Math.round(lt * ll)) && (N.width = Math.round(Fl * ll), N.height = Math.round(lt * ll), N.style.width = `${Fl}px`, N.style.height = `${lt}px`);
      }
      ensureFrame();
    }, [selectedIndex, ensureFrame]);
  React.useEffect(() => {
    setRefract(supportsRefraction());
    const d = waterRef.current;
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    d.reduce = motionQuery.matches;
    const onMotionChange = event => {
      d.reduce = event.matches;
      if (d.reduce) { d.rips = []; d.sats = []; d.mouse.on = false; d.mouse.s = 0; }
      ensureFrame();
    };
    motionQuery.addEventListener('change', onMotionChange);
    const A = canvasRef.current;
    try { d.glc = A ? createWaterRenderer(A) : null; } catch { d.glc = null; }
    setGlStatus(d.glc ? 'on' : 'off');
    const b = ll => {
      ll.preventDefault(), d.glc = null, setGlStatus("off");
      ensureFrame();
    };
    A == null || A.addEventListener("webglcontextlost", b);
    const z = new IntersectionObserver(([ll]) => {
      d.visible = ll.isIntersecting, d.visible && ensureFrame();
    });
    navRef.current && z.observe(navRef.current);
    const w = () => {
      d.visible = document.visibilityState === "visible", d.visible && ensureFrame();
    };
    return document.addEventListener("visibilitychange", w), () => {
      A == null || A.removeEventListener("webglcontextlost", b), z.disconnect(), document.removeEventListener("visibilitychange", w), cancelAnimationFrame(d.raf), d.raf = 0;
      motionQuery.removeEventListener('change', onMotionChange);
      d.glc?.destroy();
      d.glc = null;
    };
  }, [ensureFrame]), React.useLayoutEffect(() => {
    measure();
  }, [measure, items.length, compact]);
  const measureRef = React.useRef(measure);
  measureRef.current = measure, React.useEffect(() => {
    let d = -1;
    const A = new ResizeObserver(() => {
      var z;
      const b = ((z = navRef.current) == null ? void 0 : z.offsetWidth) ?? 0;
      b !== d && (d = b, waterRef.current.ready = !1, measureRef.current());
    });
    return navRef.current && A.observe(navRef.current), () => A.disconnect();
  }, []), React.useEffect(() => {
    ensureFrame();
  }, [tone, ensureFrame]);
  const localPoint = (d, A) => {
      const b = navRef.current.getBoundingClientRect();
      return {
        x: d - b.left + CANVAS_PADDING,
        y: A - b.top + CANVAS_PADDING
      };
    },
    ripple = (d, A, b) => {
      const z = waterRef.current;
      z.reduce || (z.rips.push({
        x: d,
        y: A,
        age: 0,
        amp: b
      }), ensureFrame());
    },
    iconCenter = d => {
      const A = iconRefs.current[d];
      if (!A) return null;
      const b = A.getBoundingClientRect();
      return localPoint(b.left + b.width / 2, b.top + b.height / 2);
    },
    playSound = () => {
      if (sound) try {
        const d = window.AudioContext || window.webkitAudioContext,
          A = audioRef.current || (audioRef.current = new d()),
          b = A.currentTime,
          z = A.createOscillator(),
          w = A.createGain();
        z.type = "sine", z.frequency.setValueAtTime(420 + Math.random() * 80, b), z.frequency.exponentialRampToValueAtTime(1500, b + .07), w.gain.setValueAtTime(1e-4, b), w.gain.exponentialRampToValueAtTime(.16, b + .008), w.gain.exponentialRampToValueAtTime(1e-4, b + .16), z.connect(w).connect(A.destination), z.start(b), z.stop(b + .18);
      } catch {}
    },
    select = d => {
      var z, w;
      const A = ((z = items[d]) == null ? void 0 : z.fx) ?? ((w = items[d]) != null && w.icon ? "pop" : "none");
      setIconAnimation(N => ({
        i: d,
        n: N.n + 1
      })), playSound();
      const b = iconCenter(d);
      b && A === "drop" && setTimeout(() => ripple(b.x, waterRef.current.t.cy, 1.4), 430), b && A === "plane" && ripple(b.x, b.y, .6), d !== selectedIndex && (active === void 0 && setSelected(d), onChange == null || onChange(d, items[d]));
    },
    onKeyDown = d => {
      var b;
      if (d.key !== "ArrowRight" && d.key !== "ArrowLeft") return;
      d.preventDefault();
      const A = (selectedIndex + (d.key === "ArrowRight" ? 1 : -1) + items.length) % items.length;
      select(A), (b = itemRefs.current[A]) == null || b.focus();
    },
    onPointerMove = d => {
      if (d.pointerType !== "mouse" || waterRef.current.reduce) return;
      const A = localPoint(d.clientX, d.clientY),
        b = waterRef.current;
      b.mouse.x = A.x, b.mouse.y = A.y, b.mouse.on = !0, ensureFrame();
    };
  return jsxRuntime.jsxs("nav", {
    ref: navRef,
    className: ["nimbus-nav", className].filter(Boolean).join(" "),
    "data-tone": tone,
    "data-gl": glStatus,
    "data-compact": compact === void 0 ? void 0 : String(compact),
    "data-refract": refract ? "on" : "off",
    "aria-label": "Main navigation",
    onKeyDown: onKeyDown,
    onPointerMove: onPointerMove,
    onPointerLeave: () => {
      waterRef.current.mouse.on = !1, ensureFrame();
    },
    onPointerDown: d => {
      const A = localPoint(d.clientX, d.clientY);
      ripple(A.x, A.y, .8);
    },
    style: style,
    children: [jsxRuntime.jsx("style", {
      dangerouslySetInnerHTML: {
        __html: LIQUID_NAV_CSS
      }
    }), jsxRuntime.jsx("svg", {
      width: "0",
      height: "0",
      style: {
        position: "absolute"
      },
      "aria-hidden": "true",
      children: jsxRuntime.jsxs("filter", {
        id: "nimbus-refract",
        x: "0",
        y: "0",
        width: "100%",
        height: "100%",
        colorInterpolationFilters: "sRGB",
        children: [jsxRuntime.jsx("feTurbulence", {
          type: "fractalNoise",
          baseFrequency: "0.006 0.02",
          numOctaves: "2",
          seed: "7",
          result: "noise"
        }), jsxRuntime.jsx("feGaussianBlur", {
          in: "noise",
          stdDeviation: "2",
          result: "soft"
        }), jsxRuntime.jsx("feDisplacementMap", {
          in: "SourceGraphic",
          in2: "soft",
          scale: "60",
          xChannelSelector: "R",
          yChannelSelector: "G"
        })]
      })
    }), jsxRuntime.jsx("span", {
      className: "nimbus-glass",
      "aria-hidden": "true"
    }), jsxRuntime.jsx("canvas", {
      className: "nimbus-water",
      ref: canvasRef,
      "aria-hidden": "true"
    }), jsxRuntime.jsx("span", {
      className: "nimbus-drop",
      ref: fallbackRef,
      "aria-hidden": "true"
    }), items.map((d, A) => {
      const b = d.fx ?? "pop",
        z = iconAnimation.i === A && b !== "none",
        w = {
          ref: ll => {
            itemRefs.current[A] = ll;
          },
          className: "nimbus-item",
          "aria-current": d.href && A === selectedIndex ? "location" : void 0,
          "data-active": A === selectedIndex,
          onClick: event => {
            select(A);
            d.onClick?.(event);
          }
        },
        N = jsxRuntime.jsxs(jsxRuntime.Fragment, {
          children: [d.icon && jsxRuntime.jsx("span", {
            className: "nv-ico",
            "data-fx": z ? b : void 0,
            ref: ll => {
              iconRefs.current[A] = ll;
            },
            children: d.icon
          }, z ? iconAnimation.n : 0), jsxRuntime.jsx("span", {
            className: "nimbus-label",
            children: d.label
          })]
        });
      return d.href ? jsxRuntime.jsx("a", {
        ...w,
        href: d.href,
        "aria-label": d.label,
        children: N
      }, d.label + A) : jsxRuntime.jsx("button", {
        ...w,
        type: "button",
        "aria-label": d.label,
        children: N
      }, d.label + A);
    })]
  });
}
export { LiquidNavbar };
