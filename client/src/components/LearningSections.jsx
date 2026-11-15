import { useState } from 'react';
import { ArrowRight, Atom, Brain, ChevronDown, Compass, Globe2, Lightbulb, Orbit, Sprout } from 'lucide-react';
import './learning-sections.css';

const TOPICS = [
  { icon: Orbit, category: 'Space & physics', title: 'A universe of questions.', question: 'Why does time slow down near a black hole?', color: '#a78bfa' },
  { icon: Brain, category: 'Technology', title: 'Make sense of the machine.', question: 'How does an AI learn from its mistakes?', color: '#38bdf8' },
  { icon: Sprout, category: 'The natural world', title: 'Small things. Big ideas.', question: 'How do trees communicate with each other?', color: '#34d399' },
  { icon: Globe2, category: 'Everyday economics', title: 'Understand the bigger picture.', question: 'Why can’t we just print more money?', color: '#fbbf24' },
  { icon: Atom, category: 'Science', title: 'Follow your curiosity.', question: 'What makes quantum computers different?', color: '#f472b6' },
  { icon: Lightbulb, category: 'Mind & behavior', title: 'Get to know your own mind.', question: 'Why do we remember some things and forget others?', color: '#fb923c' },
];
const LEVELS = [
  { value: 'eli5', label: 'ELI5', caption: 'Start with the big picture', color: '#f59e0b', title: 'A little tug, everywhere.', explanation: 'Gravity is a pull between things. Earth is so big that its pull keeps your feet on the ground. When you drop a ball, that pull brings it back down.', takeaway: 'Think of gravity as an invisible tug between objects.' },
  { value: 'teen', label: 'Teen', caption: 'Connect the ideas', color: '#38bdf8', title: 'Mass creates attraction.', explanation: 'Every object with mass attracts other objects. More mass means a stronger pull, while more distance makes that pull weaker. Earth’s mass is why a dropped ball accelerates toward the ground.', takeaway: 'Double the distance between two masses, and their gravitational force drops to a quarter.' },
  { value: 'expert', label: 'Expert', caption: 'Go into the details', color: '#10b981', title: 'From force to spacetime.', explanation: 'Newtonian gravity models attraction as F = Gm₁m₂/r². General relativity describes gravity through spacetime curvature sourced by energy and momentum; freely falling bodies follow geodesics.', takeaway: 'Newton’s model is an effective approximation in weak fields at low velocities.' },
];
const FAQS = [
  ['What does ELI5 mean?', '“Explain like I’m five.” It means starting with plain language, familiar examples, and the core idea. You don’t need to be five to find that useful.'],
  ['Which explanation level should I choose?', 'Choose ELI5 when a topic is new, Teen for more context and terminology, or Expert for a technical explanation. You can explain the same question again at another level.'],
  ['Can I ask a follow-up question?', 'Yes. After an explanation, use the follow-up input to ask about a detail or request another example. Your current explanation is included as context.'],
  ['Where can I find my previous explanations?', 'Open Recent in the top bar. Up to 20 explanations are saved in this browser. You can clear them from the history drawer.'],
  ['How can I check what I’ve learned?', 'Each generated explanation includes a knowledge check. Answer the questions, check the explanations, and retry the quiz whenever you like.'],
];

export default function LearningSections({ onChooseTopic }) {
  const [selectedLevel, setSelectedLevel] = useState('eli5');
  const example = LEVELS.find(item => item.value === selectedLevel);

  return (
    <div className="learning-home">
      <section id="how-it-works" className="learning-section" aria-labelledby="how-heading">
        <div className="learning-heading"><span className="section-kicker">A little curiosity goes a long way</span><h2 id="how-heading">From “wait, what?”<br />to “oh, I get it.”</h2><p>You bring the question. We help you connect the dots.</p></div>
        <ol className="learning-steps">
          <li><span className="learning-step-number">01 / ASK</span><h3>Start anywhere.</h3><p>A big idea, a confusing paragraph, or that question you’ve always wanted to ask.</p></li>
          <li><span className="learning-step-number">02 / UNDERSTAND</span><h3>Find your level.</h3><p>Get a clear explanation, a concrete example, and the key ideas to take with you.</p></li>
          <li><span className="learning-step-number">03 / MAKE IT STICK</span><h3>Put it together.</h3><p>Try the quiz, ask a follow-up, or come back to your explanation in Recent.</p></li>
        </ol>
      </section>

      <section className="learning-section learning-depth" aria-labelledby="depth-heading">
        <div className="learning-depth-intro">
          <span className="section-kicker">Same idea. Your wavelength.</span><h2 id="depth-heading">Clarity comes<br />in different depths.</h2><p>You don’t have to know the terminology to start. Explore how one idea changes across three levels.</p>
          <div className="learning-levels" role="group" aria-label="Example explanation level">
            {LEVELS.map(item => <button key={item.value} type="button" aria-pressed={selectedLevel === item.value} onClick={() => setSelectedLevel(item.value)} style={{ '--example-color': item.color }}><span className="learning-level-dot" /><strong>{item.label}</strong><span>{item.caption}</span><ArrowRight size={15} aria-hidden="true" /></button>)}
          </div>
        </div>
        <div className="learning-example" style={{ '--example-color': example.color }}>
          <div className="learning-example-top"><span><Orbit size={15} aria-hidden="true" /> WHAT IS GRAVITY?</span><span className="learning-example-badge">{example.label}</span></div>
          <div className="learning-example-copy" aria-live="polite" aria-atomic="true"><span className="learning-example-label">Example explanation</span><h3>{example.title}</h3><p>{example.explanation}</p><div className="learning-example-takeaway"><Lightbulb size={17} aria-hidden="true" /><p>{example.takeaway}</p></div></div>
          <button className="learning-text-link" type="button" onClick={() => onChooseTopic('What is gravity and how does it work?', selectedLevel)}>Try a question at this level <ArrowRight size={15} aria-hidden="true" /></button>
        </div>
      </section>

      <section id="explore" className="learning-section" aria-labelledby="explore-heading">
        <div className="learning-heading learning-heading-row"><div><span className="section-kicker">Take the scenic route</span><h2 id="explore-heading">What pulls you in?</h2></div><p>Pick a starting point. <br />See where your curiosity takes you.</p></div>
        <div className="learning-topics">
          {TOPICS.map(({ icon: Icon, category, title, question, color }) => <button className="learning-topic" key={category} type="button" onClick={() => onChooseTopic(question)} style={{ '--topic-color': color }}><div className="learning-topic-top"><span className="learning-topic-icon"><Icon size={20} strokeWidth={1.5} aria-hidden="true" /></span><ArrowRight className="learning-topic-arrow" size={17} aria-hidden="true" /></div><span className="learning-topic-category">{category}</span><h3>{title}</h3><p>{question}</p><span className="learning-topic-action">Explore this question <ArrowRight size={12} aria-hidden="true" /></span></button>)}
        </div>
      </section>

      <section id="faq" className="learning-section learning-faq" aria-labelledby="faq-heading">
        <div className="learning-heading"><span className="section-kicker">Before you dive in</span><h2 id="faq-heading">A few good questions.</h2><p>The small details, explained simply.</p><Compass className="learning-faq-compass" size={68} strokeWidth={.7} aria-hidden="true" /></div>
        <div className="learning-faq-list">{FAQS.map(([question, answer]) => <details key={question} name="learning-faq"><summary>{question}<ChevronDown size={16} aria-hidden="true" /></summary><p>{answer}</p></details>)}</div>
      </section>
      <footer className="learning-footer">
        <div><a className="learning-footer-brand" href="#ask-question">ELI5 Simplifier <span aria-hidden="true">↗</span></a><p>Stay curious. Make things click.</p></div>
        <nav aria-label="Footer"><a href="#how-it-works">How it works</a><a href="#explore">Explore</a><a href="#faq">FAQ</a></nav>
        <button type="button" className="secondary-button" onClick={() => onChooseTopic('')}>Ask your own question <ArrowRight size={14} aria-hidden="true" /></button>
      </footer>
    </div>
  );
}
