import DotField from './DotField';

export default function HeroIntro() {
  return (
    <div className="hero-scroll-track">
      <section className="hero-section px-4 flex flex-col items-center min-h-[calc(100vh-84px)] justify-center">
        <div className="hero-content hero-intro">
          <div className="status-badge"><span className="status-dot" /> AI learning companion</div>
          <DotField />
        </div>
      </section>
    </div>
  );
}
