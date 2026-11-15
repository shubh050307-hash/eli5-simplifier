import { useLayoutEffect, useRef } from 'react';
import { Clock } from 'lucide-react';
import { LiquidNavbar } from './liquid-navbar/LiquidNavbar';
import './learning-sections.css';
import './liquid-navbar/liquid-navbar-theme.css';

export default function Navbar({ onHistoryOpen, showHomeLinks }) {
  const headerRef = useRef(null);

  useLayoutEffect(() => {
    const header = headerRef.current;
    const updateHeight = () => {
      document.documentElement.style.setProperty('--navbar-height', `${header.getBoundingClientRect().height}px`);
    };
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(header);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty('--navbar-height');
    };
  }, []);

  const items = [
    ...(showHomeLinks ? [{ label: 'How it works', href: '#how-it-works', fx: 'none' }] : []),
    { label: 'Ask a question', href: '#ask-question', fx: 'none' },
    ...(showHomeLinks ? [{ label: 'FAQ', href: '#faq', fx: 'none' }] : []),
    { label: 'Recent', icon: <Clock size={14} />, fx: 'pop', onClick: onHistoryOpen },
  ];

  return (
    <header ref={headerRef} className="learning-home site-navbar-shell">
      <div className="site-navbar">
        <a className="site-navbar-brand" href="#ask-question" aria-label="ELI5 Simplifier">
          <span className="site-navbar-brand-name">ELI5</span>{' '}
          <span className="site-navbar-brand-detail">Simplifier</span>
        </a>
        <LiquidNavbar
          key={showHomeLinks ? 'home-navigation' : 'explanation-navigation'}
          className="eli5-liquid-nav"
          items={items}
          defaultActive={showHomeLinks ? 1 : 0}
          tone="dark"
          compact={false}
          sound={false}
          style={{
            '--n-tint': 'rgba(18, 18, 24, .58)',
            '--n-fg': '#f4ead9',
            '--n-fg-soft': 'rgba(220, 218, 225, .68)',
            '--n-rim': 'rgba(255, 245, 225, .3)',
          }}
        />
      </div>
    </header>
  );
}
