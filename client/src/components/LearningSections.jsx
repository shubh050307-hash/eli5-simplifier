import { useState } from 'react';
import { ArrowRight, ChevronDown, Lightbulb, Orbit } from 'lucide-react';
import './learning-sections.css';

const LEVELS = [
  { value: 'eli5', label: 'ELI5', caption: 'Start with the big picture', color: '#f59e0b', title: 'A little tug, everywhere.', explanation: 'Gravity is a pull between things. Earth is so big that its pull keeps your feet on the ground. When you drop a ball, that pull brings it back down.', takeaway: 'Think of gravity as an invisible tug between objects.' },
  { value: 'teen', label: 'Teen', caption: 'Connect the ideas', color: '#38bdf8', title: 'Mass creates attraction.', explanation: 'Every object with mass attracts other objects. More mass means a stronger pull, while more distance makes that pull weaker. Earth’s mass is why a dropped ball accelerates toward the ground.', takeaway: 'Double the distance between two masses, and their gravitational force drops to a quarter.' },
  { value: 'expert', label: 'Expert', caption: 'Go into the details', color: '#10b981', title: 'From force to spacetime.', explanation: 'Newtonian gravity models attraction as F = Gm₁m₂/r². General relativity describes gravity through spacetime curvature sourced by energy and momentum; freely falling bodies follow geodesics.', takeaway: 'Newton’s model is an effective approximation in weak fields at low velocities.' },
];
const FAQS = [
  ['What does ELI5 mean?', '“Explain like I’m five.” It means starting with plain language, familiar examples, and the core idea. You don’t need to be five to find that useful.'],
  ['Which explanation level should I choose?', 'Choose ELI5 when a topic is new, Teen for more context and terminology, or Expert for a technical explanation. You can explain the same question again at another level.'],
  ['Can I ask a follow-up question?', 'Yes. After an explanation, use the follow-up input to ask about a detail or request another example. Your current explanation is included as context.'],
  ['Where can I find my previous explanations?', 'Open Recent in the top navigation. Up to 20 explanations are saved in this browser. You can clear them from the history drawer.'],
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

      <section id="faq" className="learning-section learning-faq" aria-labelledby="faq-heading">
        <div className="learning-heading"><span className="section-kicker">Before you dive in</span><h2 id="faq-heading">A few good questions.</h2><p>The small details, explained simply.</p></div>
        <div className="learning-faq-list">{FAQS.map(([question, answer]) => <details key={question} name="learning-faq"><summary>{question}<ChevronDown size={16} aria-hidden="true" /></summary><p>{answer}</p></details>)}</div>
      </section>

    </div>
  );
}
