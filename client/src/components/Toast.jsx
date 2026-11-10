import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const CFG = {
  success: { Icon: CheckCircle2, color:'#10B981', bg:'rgba(16,185,129,0.12)', border:'rgba(16,185,129,0.28)' },
  error:   { Icon: AlertCircle,  color:'#F87171', bg:'rgba(248,113,113,0.12)', border:'rgba(248,113,113,0.28)' },
  warning: { Icon: AlertTriangle,color:'#F59E0B', bg:'rgba(245,158,11,0.12)',  border:'rgba(245,158,11,0.28)'  },
  info:    { Icon: Info,         color:'#38BDF8', bg:'rgba(56,189,248,0.12)',   border:'rgba(56,189,248,0.28)'  },
};

export default function Toast({ message, type = 'info', onClose }) {
  const { Icon, color, bg, border } = CFG[type] || CFG.info;
  return (
    <div style={{ position:'fixed', bottom:'24px', right:'24px', zIndex:400 }}>
      <motion.div
        initial={{ opacity:0, y:16, scale:0.95 }}
        animate={{ opacity:1, y:0, scale:1 }}
        exit={{ opacity:0, y:16, scale:0.95 }}
        transition={{ type:'spring', stiffness:500, damping:40 }}
        style={{
          display:'flex', alignItems:'flex-start', gap:'10px',
          padding:'12px 16px', borderRadius:'13px',
          maxWidth:'360px', backdropFilter:'blur(16px)',
          background: bg, border:`1px solid ${border}`,
          boxShadow:'0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 0 rgba(255,255,255,0.08)',
        }}
      >
        <Icon size={15} style={{ color, flexShrink:0, marginTop:'1px' }} />
        <p style={{ flex:1, fontSize:'13px', lineHeight:1.5, color:'#F4F4F6', margin:0 }}>{message}</p>
        <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'#52525B', padding:'0', flexShrink:0 }}>
          <X size={13}/>
        </button>
      </motion.div>
    </div>
  );
}
