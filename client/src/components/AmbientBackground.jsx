const MODE_COLORS = {
  idle:    'rgba(120,119,198,0.10)',
  loading: 'rgba(120,119,198,0.20)',
  eli5:    'rgba(245,158,11,0.09)',
  teen:    'rgba(56,189,248,0.09)',
  expert:  'rgba(16,185,129,0.09)',
};

export default function AmbientBackground({ mode, loading }) {
  const color = loading ? MODE_COLORS.loading : (MODE_COLORS[mode] || MODE_COLORS.idle);
  return (
    <div style={{ position:'fixed', inset:0, zIndex:0, overflow:'hidden', pointerEvents:'none' }}>
      {/* Radial mesh */}
      <div style={{
        position:'absolute', inset:0,
        transition:'background 1.2s ease',
        background:`
          radial-gradient(ellipse 80% 50% at 50% 0%, ${color}, transparent 70%),
          radial-gradient(ellipse 50% 40% at 85% 90%, rgba(120,119,198,0.05), transparent 60%),
          radial-gradient(ellipse 40% 30% at 15% 65%, rgba(16,185,129,0.04), transparent 55%)
        `,
      }} />

      {/* Dot grid */}
      <div style={{
        position:'absolute', inset:0, opacity:0.28,
        backgroundImage:'radial-gradient(circle, rgba(255,255,255,0.18) 1px, transparent 1px)',
        backgroundSize:'24px 24px',
        maskImage:'radial-gradient(ellipse 85% 55% at 50% 0%, black 15%, transparent 80%)',
        WebkitMaskImage:'radial-gradient(ellipse 85% 55% at 50% 0%, black 15%, transparent 80%)',
      }} />

      {/* SVG grain */}
      <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', opacity:0.025 }} xmlns="http://www.w3.org/2000/svg">
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
          <feColorMatrix type="saturate" values="0"/>
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)"/>
      </svg>

      {/* Loading pulse */}
      {loading && (
        <div style={{
          position:'absolute', top:0, left:'50%', transform:'translateX(-50%)',
          width:'700px', height:'350px',
          background:'radial-gradient(ellipse at 50% 0%, rgba(120,119,198,0.18), transparent 70%)',
          animation:'pulse 2s ease-in-out infinite',
        }}/>
      )}
    </div>
  );
}
