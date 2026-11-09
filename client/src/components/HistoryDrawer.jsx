import { AnimatePresence, motion } from 'framer-motion';
import { Clock, Trash2, X, Download } from 'lucide-react';
import { formatTimeAgo, exportAsMarkdown, downloadMarkdown } from '../lib/utils';

export default function HistoryDrawer({ open, onClose, history, onLoad, onClear }) {
  const handleExport = (entry) => {
    const md = exportAsMarkdown(entry.query, entry);
    downloadMarkdown(md, `eli5-${entry.query.slice(0,30).replace(/\s+/g,'-').toLowerCase()}.md`);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            onClick={onClose}
            style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(0,0,0,0.55)', backdropFilter:'blur(4px)' }}
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x:'100%' }} animate={{ x:0 }} exit={{ x:'100%' }}
            transition={{ type:'spring', stiffness:380, damping:38 }}
            style={{
              position:'fixed', top:0, right:0, bottom:0, zIndex:201,
              width:'100%', maxWidth:'400px', display:'flex', flexDirection:'column',
              background:'rgba(10,10,16,0.97)',
              borderLeft:'1px solid rgba(255,255,255,0.08)',
              backdropFilter:'blur(24px)',
              boxShadow:'-16px 0 60px rgba(0,0,0,0.6)',
            }}
          >
            {/* Header */}
            <div style={{
              display:'flex', alignItems:'center', justifyContent:'space-between',
              padding:'18px 20px', borderBottom:'1px solid rgba(255,255,255,0.07)',
            }}>
              <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                <Clock size={14} style={{ color:'#52525B' }}/>
                <span style={{ fontSize:'14px', fontWeight:600, color:'#F4F4F6' }}>Recent Queries</span>
                {history.length > 0 && (
                  <span style={{
                    fontFamily:'var(--font-mono)', fontSize:'9px', color:'#52525B',
                    border:'1px solid rgba(82,82,91,0.4)', borderRadius:'4px', padding:'2px 6px',
                  }}>{history.length}</span>
                )}
              </div>
              <div style={{ display:'flex', gap:'6px' }}>
                {history.length > 0 && (
                  <button onClick={onClear} style={{
                    display:'flex', alignItems:'center', gap:'5px',
                    padding:'5px 10px', borderRadius:'8px', border:'none',
                    background:'transparent', color:'#52525B', fontSize:'11px', cursor:'pointer',
                    transition:'all 0.15s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.color='#F87171'; e.currentTarget.style.background='rgba(248,113,113,0.08)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color='#52525B'; e.currentTarget.style.background='transparent'; }}
                  >
                    <Trash2 size={11}/> Clear
                  </button>
                )}
                <button onClick={onClose} style={{
                  width:'30px', height:'30px', borderRadius:'8px', border:'none',
                  background:'transparent', color:'#52525B', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
                  transition:'all 0.15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.color='#A1A1AA'; e.currentTarget.style.background='rgba(255,255,255,0.06)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color='#52525B'; e.currentTarget.style.background='transparent'; }}
                >
                  <X size={14}/>
                </button>
              </div>
            </div>

            {/* List */}
            <div style={{ flex:1, overflowY:'auto', padding:'12px' }}>
              {history.length === 0 ? (
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'200px', gap:'10px' }}>
                  <Clock size={28} style={{ color:'#52525B', opacity:0.4 }}/>
                  <p style={{ color:'#52525B', fontSize:'13px', margin:0 }}>No history yet.</p>
                  <p style={{ color:'#52525B', fontSize:'11px', margin:0, opacity:0.6 }}>Queries appear here after submitting.</p>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                  {history.map((entry) => (
                    <div
                      key={entry.id || entry.timestamp}
                      onClick={() => onLoad(entry)}
                      style={{
                        position:'relative', padding:'12px 14px', borderRadius:'11px',
                        border:'1px solid rgba(255,255,255,0.07)',
                        background:'rgba(255,255,255,0.02)',
                        cursor:'pointer', transition:'all 0.18s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.12)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'; }}
                    >
                      <p className="clamp-2" style={{ fontSize:'13px', fontWeight:500, color:'#F4F4F6', marginBottom:'8px', lineHeight:1.45, paddingRight:'28px' }}>
                        {entry.query}
                      </p>
                      <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                        <span style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color:'#52525B' }}>{formatTimeAgo(entry.timestamp)}</span>
                        <div style={{ display:'flex', gap:'4px' }}>
                          {['eli5','teen','expert'].map(m => (
                            <div key={m} style={{
                              width:'5px', height:'5px', borderRadius:'50%',
                              background: entry[m]
                                ? m==='eli5' ? '#F59E0B' : m==='teen' ? '#38BDF8' : '#10B981'
                                : 'rgba(255,255,255,0.08)',
                            }}/>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); handleExport(entry); }}
                        style={{
                          position:'absolute', top:'10px', right:'10px',
                          width:'26px', height:'26px', borderRadius:'7px', border:'none',
                          background:'transparent', color:'#52525B', cursor:'pointer',
                          display:'flex', alignItems:'center', justifyContent:'center',
                          transition:'all 0.15s', opacity:0,
                        }}
                        onMouseEnter={e => e.currentTarget.style.color='#A1A1AA'}
                        onMouseLeave={e => e.currentTarget.style.color='#52525B'}
                        ref={el => {
                          if (!el) return;
                          const p = el.parentElement;
                          if (!p) return;
                          p.addEventListener('mouseenter', () => el.style.opacity='1');
                          p.addEventListener('mouseleave', () => el.style.opacity='0');
                        }}
                      >
                        <Download size={12}/>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
