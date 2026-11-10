import { GitFork, Clock } from 'lucide-react';

export default function Navbar({ onHistoryOpen }) {
  return (
    <header style={{ position:'sticky', top:'12px', zIndex:50, padding:'0 16px', marginBottom:'4px' }}>
      <nav style={{
        maxWidth:'1300px', margin:'0 auto', height:'60px',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'0 18px', borderRadius:'16px',
        background:'rgba(14,14,20,0.85)', backdropFilter:'blur(20px)',
        border:'1px solid rgba(255,255,255,0.08)',
        boxShadow:'inset 0 1px 0 0 rgba(255,255,255,0.08), 0 4px 24px rgba(0,0,0,0.5)',
      }}>

        {/* Left — Brand */}
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width:'28px', height:'28px', flexShrink:0 }}>
            <defs>
              <linearGradient id="eg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="50%" stopColor="#38BDF8" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
            </defs>
            <polygon points="16,2 30,10 30,22 16,30 2,22 2,10" stroke="url(#eg)" strokeWidth="1.5" fill="none" />
            <polygon points="16,8 24,13 24,20 16,24 8,20 8,13" stroke="url(#eg)" strokeWidth="1" fill="none" opacity="0.45" />
            <circle cx="16" cy="16" r="2.5" fill="url(#eg)" />
          </svg>
          <div>
            <span style={{ color:'#F4F4F6', fontWeight:600, fontSize:'14px', letterSpacing:'-0.02em' }}>ELI5 Simplifier</span>
            <span style={{
              fontFamily:'var(--font-mono)', fontSize:'9px', textTransform:'uppercase',
              letterSpacing:'0.12em', color:'#52525B',
              border:'1px solid rgba(82,82,91,0.4)', borderRadius:'4px',
              padding:'2px 6px', marginLeft:'8px',
              display: 'none',
            }} className="sm:inline">v2.4 ENGINE</span>
          </div>
        </div>

        {/* Right — Actions */}
        <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
          <button onClick={onHistoryOpen} style={{
            display:'flex', alignItems:'center', gap:'7px',
            padding:'6px 12px', borderRadius:'10px', border:'1px solid transparent',
            background:'transparent', color:'#A1A1AA',
            fontSize:'12px', fontWeight:500, cursor:'pointer',
            transition:'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.09)'; e.currentTarget.style.color='#F4F4F6'; e.currentTarget.style.background='rgba(255,255,255,0.05)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='transparent'; e.currentTarget.style.color='#A1A1AA'; e.currentTarget.style.background='transparent'; }}
          >
            <Clock size={14} />
            <span>Recent</span>
            <kbd style={{ fontFamily:'var(--font-mono)', fontSize:'9px', border:'1px solid rgba(82,82,91,0.5)', borderRadius:'4px', padding:'1px 5px', color:'#52525B', display:'none' }} className="sm:inline">⌘K</kbd>
          </button>

          <a
            href="https://github.com/shubh050307-hash/eli5-simplifier"
            target="_blank" rel="noopener noreferrer"
            style={{
              display:'flex', alignItems:'center', justifyContent:'center',
              width:'34px', height:'34px', borderRadius:'10px',
              border:'1px solid transparent',
              color:'#A1A1AA', transition:'all 0.15s', textDecoration:'none',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.09)'; e.currentTarget.style.color='#F4F4F6'; e.currentTarget.style.background='rgba(255,255,255,0.05)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='transparent'; e.currentTarget.style.color='#A1A1AA'; e.currentTarget.style.background='transparent'; }}
          >
            <GitFork size={15} />
          </a>
        </div>
      </nav>
    </header>
  );
}
