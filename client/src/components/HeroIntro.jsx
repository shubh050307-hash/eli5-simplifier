import DotField from './DotField';

export default function HeroIntro() {
  return (
    <div className="hero-scroll-track">
      <section className="hero-section px-4 flex flex-col items-center min-h-screen justify-center">
        <div className="hero-content hero-intro">
          <DotField />
        </div>
      </section>
    </div>
  );
}
