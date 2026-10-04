"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";

type GameId =
  | "typing"
  | "word"
  | "chess"
  | "geography"
  | "budget"
  | "constitution"
  | "logic"
  | "market";
type ToolId = "calculator" | "marks" | "converter" | "timer" | "text" | "random";
type Category = "all" | "academic" | "utilities" | "current" | "games";

type SubjectTool = {
  title: string;
  icon: string;
  tag: string;
  description: string;
  href: string;
  capabilities: string[];
};

const subjectTools: SubjectTool[] = [
  { title: "Mathematics", icon: "∑", tag: "Class XI–XII", description: "Interactive tools for graphs, functions, equations, probability and calculation.", href: "/tools/mathematics", capabilities: ["Graphing", "Calculation", "Visualization"] },
  { title: "Physics", icon: "⚛", tag: "Class XI–XII", description: "Explore physical systems, formulas, units and quantitative problem solving.", href: "/tools/physics", capabilities: ["Simulation", "Calculation", "Reference"] },
  { title: "Chemistry", icon: "⚗", tag: "Class XI–XII", description: "Reaction, mole, periodic and chemistry reference tools for senior school.", href: "/tools/chemistry", capabilities: ["Reference", "Calculation", "Practice"] },
  { title: "Biology", icon: "🧬", tag: "Class XI–XII", description: "Interactive biological systems, processes and laboratory-style visualizations.", href: "/tools/biology", capabilities: ["Simulation", "Systems Lab", "Visualization"] },
  { title: "Economics", icon: "₹", tag: "Class XI–XII", description: "Visualize markets, demand, supply and core economic relationships.", href: "/tools/economics", capabilities: ["Graphs", "Simulation", "Analysis"] },
  { title: "Geography", icon: "◎", tag: "Class XI–XII", description: "Explore maps, physical geography and CBSE-oriented map practice.", href: "/tools/geography", capabilities: ["Maps", "Practice", "Reference"] },
  { title: "History", icon: "⌛", tag: "Class XI–XII", description: "Structured historical reference, timelines and interactive study tools.", href: "/tools/history", capabilities: ["Timeline", "Reference", "Study"] },
  { title: "Political Science", icon: "⚖", tag: "Class XI–XII", description: "Constitutional, institutional and political concepts through interactive study tools.", href: "/tools/political-science", capabilities: ["Reference", "Simulation", "Practice"] },
];

const games: { id: GameId; icon: string; title: string; tag: string; description: string; difficulty: string }[] = [
  { id: "typing", icon: "⌨", title: "Typing Race", tag: "Speed + Accuracy", description: "Build speed without sacrificing accuracy.", difficulty: "Easy" },
  { id: "word", icon: "Aa", title: "Word Game", tag: "Vocabulary", description: "Solve anagrams before the clock runs out.", difficulty: "Easy" },
  { id: "geography", icon: "◎", title: "Geography Guess", tag: "Geography", description: "Identify places from progressively revealing clues.", difficulty: "Medium" },
  { id: "logic", icon: "∴", title: "Logic Lab", tag: "Reasoning", description: "Sequences, deduction, patterns and quantitative logic.", difficulty: "Medium" },
  { id: "constitution", icon: "§", title: "Constitution Challenge", tag: "Polity", description: "Make institutional decisions and understand their consequences.", difficulty: "Medium" },
  { id: "budget", icon: "₹", title: "Budget Challenge", tag: "Public Policy", description: "Balance competing public priorities under a fixed budget.", difficulty: "Hard" },
  { id: "market", icon: "↗", title: "Market Simulator", tag: "Economics", description: "Set prices, production and strategy in a changing market.", difficulty: "Hard" },
  { id: "chess", icon: "♞", title: "Chess", tag: "Strategy", description: "Play a proper local two-player chess game with legal moves.", difficulty: "Hard" },
];

const passages = [
  "Institutions matter because rules shape incentives, incentives shape behaviour, and behaviour shapes outcomes.",
  "A good argument does not merely state a conclusion. It explains the reasoning and shows the evidence that makes the conclusion credible.",
  "Economic choices are rarely free of tradeoffs. Resources are limited, so every decision carries an opportunity cost.",
  "Geography connects physical systems with human activity, revealing why places develop differently over time.",
];

const anagrams = [
  { word: "democracy", scrambled: "craydemoc", hint: "A system in which political authority ultimately derives from the people." },
  { word: "inflation", scrambled: "flationin", hint: "A sustained rise in the general price level." },
  { word: "latitude", scrambled: "titudela", hint: "Angular distance north or south of the Equator." },
  { word: "evidence", scrambled: "evdience", hint: "Information used to support a claim." },
  { word: "federalism", scrambled: "deralfisem", hint: "A system dividing constitutional authority between levels of government." },
  { word: "photosynthesis", scrambled: "synthphotoesis", hint: "The process by which plants convert light energy into chemical energy." },
  { word: "elasticity", scrambled: "sticityela", hint: "A measure of responsiveness to a change in another variable." },
  { word: "sovereignty", scrambled: "reigntysover", hint: "Supreme authority within a territory." },
];

const geographyQuestions = [
  { answer: "India", clues: ["This country has the Himalayas along its northern frontier.", "It has one of the world's longest coastlines in the Indian Ocean region.", "Its capital is New Delhi."] },
  { answer: "Brazil", clues: ["It contains a huge portion of the Amazon Basin.", "Portuguese is its official language.", "Brasília is its capital."] },
  { answer: "Egypt", clues: ["A major river runs through its territory from south to north.", "It connects the Mediterranean and Red Sea through a famous canal.", "Its capital is Cairo."] },
  { answer: "Japan", clues: ["It is an island country in East Asia.", "It lies along the Pacific Ring of Fire.", "Tokyo is its capital."] },
  { answer: "Australia", clues: ["It is both a country and a continent.", "The Great Barrier Reef lies off its northeastern coast.", "Canberra is its capital."] },
  { answer: "Kenya", clues: ["It lies in East Africa and has a coast on the Indian Ocean.", "The Equator crosses its territory.", "Nairobi is its capital."] },
];

const logicQuestions = [
  { q: "What comes next: 2, 6, 12, 20, 30, ?", options: ["36", "40", "42", "44"], answer: 2, explanation: "The differences are 4, 6, 8, 10, so the next difference is 12: 42." },
  { q: "All economists are analysts. Some analysts are writers. Which statement must be true?", options: ["All writers are economists", "Some economists are writers", "All economists are analysts", "No analysts are writers"], answer: 2, explanation: "The first statement directly establishes that every economist is an analyst." },
  { q: "A clock shows 3:00. What is the angle between the hands?", options: ["30", "60", "90", "120"], answer: 2, explanation: "At 3:00 the minute hand is at 12 and the hour hand is at 3, creating 90 degrees." },
  { q: "If CAT becomes DBU by shifting each letter forward once, DOG becomes:", options: ["EPH", "EPG", "EOG", "FPH"], answer: 0, explanation: "D→E, O→P and G→H." },
  { q: "A fair coin is tossed twice. Probability of exactly one head?", options: ["1/4", "1/2", "3/4", "1"], answer: 1, explanation: "HT and TH are two of four equally likely outcomes." },
  { q: "If some A are B and no B are C, which must be true?", options: ["Some A are not C", "All A are C", "No A are B", "Some C are B"], answer: 0, explanation: "The A elements that are B cannot be C because no B is C." },
];

const constitutionQuestions = [
  { scenario: "A hypothetical law appears to violate a Fundamental Right. Which institution has the strongest constitutional role in reviewing its validity?", options: ["Judiciary", "Election Commission", "CAG", "Finance Commission"], answer: 0, explanation: "Judicial review allows courts to examine whether laws comply with the Constitution." },
  { scenario: "A government wants to spend public money without legislative authorization. What principle is most directly implicated?", options: ["Legislative control over public finance", "Universal adult franchise", "Federal courtesy", "Judicial appointments"], answer: 0, explanation: "Public finance is subject to constitutional and legislative controls." },
  { scenario: "A state and the Union disagree about legislative competence. What constitutional idea becomes central?", options: ["Division of powers", "Collective responsibility", "Impeachment", "Money bill procedure"], answer: 0, explanation: "India's federal structure distributes legislative subjects between the Union and states." },
  { scenario: "An elected government loses the confidence of the lower house. What democratic principle is most directly involved?", options: ["Parliamentary accountability", "Judicial independence", "Census procedure", "Local taxation"], answer: 0, explanation: "In a parliamentary system, the executive must retain the confidence of the elected house." },
];

function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function Progress({ value }: { value: number }) {
  return <div className="h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-slate-950 transition-all duration-300" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div>;
}

function GameShell({ title, subtitle, onClose, children }: { title: string; subtitle: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-md sm:p-8">
      <div className="mx-auto min-h-full max-w-5xl py-4 sm:py-8">
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-7">
            <div><p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">Interactive Lab</p><h2 className="mt-1 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">{title}</h2><p className="text-sm text-slate-500">{subtitle}</p></div>
            <button onClick={onClose} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100">Exit</button>
          </div>
          <div className="p-5 sm:p-8">{children}</div>
        </div>
      </div>
    </div>
  );
}

function ResultScreen({ score, summary, onAgain, onExit }: { score: number; summary: string[]; onAgain: () => void; onExit: () => void }) {
  return <div className="mx-auto max-w-xl py-8 text-center"><div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-slate-950 text-4xl font-black text-white shadow-xl">{score}</div><p className="mt-5 text-xs font-black uppercase tracking-[0.25em] text-slate-500">Session complete</p><h3 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Good work. Humanity survives another quiz.</h3><div className="mt-7 grid gap-3 sm:grid-cols-2">{summary.map((item) => <div key={item} className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-700">{item}</div>)}</div><div className="mt-7 flex justify-center gap-3"><button onClick={onAgain} className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white">Play again</button><button onClick={onExit} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700">Back to Lab</button></div></div>;
}

function TypingGame({ close }: { close: () => void }) {
  const [passage, setPassage] = useState(passages[0]);
  const [text, setText] = useState("");
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [mode, setMode] = useState<30 | 60>(30);
  useEffect(() => { if (!started || done) return; const id = window.setInterval(() => setSeconds((s) => { if (s + 1 >= mode) { setDone(true); return mode; } return s + 1; }), 1000); return () => clearInterval(id); }, [started, done, mode]);
  const correct = text.split("").filter((c, i) => c === passage[i]).length;
  const accuracy = text.length ? Math.round((correct / text.length) * 100) : 100;
  const wpm = seconds ? Math.round((correct / 5) / (seconds / 60)) : 0;
  const reset = () => { setPassage(passages[Math.floor(Math.random() * passages.length)]); setText(""); setStarted(false); setDone(false); setSeconds(0); };
  return <GameShell title="Typing Race" subtitle="Speed + accuracy" onClose={close}>{done ? <ResultScreen score={Math.max(0, Math.round(wpm * accuracy / 100))} summary={[`${wpm} WPM`, `${accuracy}% accuracy`, `${correct}/${text.length} characters correct`, `${seconds}s session`]} onAgain={reset} onExit={close} /> : <div className="mx-auto max-w-3xl"><div className="flex flex-wrap items-center justify-between gap-3"><div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">{mode}s mode</span><span className="ml-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">{wpm} WPM</span></div><div className="text-sm font-black text-slate-500">{seconds}s / {mode}s</div></div><div className="mt-5 rounded-3xl bg-slate-950 p-6 text-lg font-semibold leading-8 text-white sm:p-8">{[...passage].map((char, i) => <span key={`${char}-${i}`} className={i < text.length ? (text[i] === char ? "text-emerald-300" : "text-red-300") : "text-white/50"}>{char}</span>)}</div><textarea autoFocus value={text} disabled={done || text.length >= passage.length} onChange={(e) => { if (!started) setStarted(true); setText(e.target.value.slice(0, passage.length)); }} className="mt-5 min-h-32 w-full resize-none rounded-2xl border border-slate-200 p-5 text-base outline-none ring-slate-300 focus:ring-2" placeholder="Start typing the passage here..." /><div className="mt-4 flex items-center justify-between"><div className="w-2/3"><Progress value={(text.length / passage.length) * 100} /></div><button onClick={reset} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold">Restart</button></div><p className="mt-5 text-sm text-slate-500">Accuracy: <strong>{accuracy}%</strong> · Correct characters: <strong>{correct}</strong> · Remaining: <strong>{Math.max(0, passage.length - text.length)}</strong></p></div>}</GameShell>;
}

function WordGame({ close }: { close: () => void }) {
  const makeRound = () => shuffle(anagrams).slice(0, 6);
  const [rounds, setRounds] = useState(makeRound);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [hint, setHint] = useState(false);
  const [done, setDone] = useState(false);
  const current = rounds[index];
  const submit = () => { if (!current || !answer.trim()) return; if (answer.trim().toLowerCase() === current.word) setScore((s) => s + (hint ? 70 : 100)); else setWrong((w) => w + 1); setAnswer(""); setHint(false); if (index === rounds.length - 1) setDone(true); else setIndex((i) => i + 1); };
  const reset = () => { setRounds(makeRound()); setIndex(0); setAnswer(""); setScore(0); setWrong(0); setHint(false); setDone(false); };
  return <GameShell title="Word Game" subtitle="Vocabulary + anagrams" onClose={close}>{done ? <ResultScreen score={score} summary={[`${score} points`, `${rounds.length - wrong} successful rounds`, `${wrong} incorrect attempts`, "Hint use reduces the round score"]} onAgain={reset} onExit={close} /> : <div className="mx-auto max-w-2xl text-center"><div className="flex justify-between text-sm font-bold text-slate-500"><span>Round {index + 1} / {rounds.length}</span><span>{score} points</span></div><div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-8"><p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">Unscramble</p><div className="mt-4 text-4xl font-black tracking-[0.12em] text-slate-950">{current.scrambled}</div>{hint && <p className="mt-4 text-sm text-slate-600">{current.hint}</p>}</div><input value={answer} onChange={(e) => setAnswer(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} className="mt-5 w-full rounded-2xl border border-slate-200 px-5 py-4 text-center text-lg font-bold outline-none focus:ring-2 focus:ring-slate-300" placeholder="Type the word..." autoFocus /><div className="mt-4 flex justify-center gap-3"><button onClick={() => setHint(true)} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold">Hint</button><button onClick={submit} className="rounded-xl bg-slate-950 px-6 py-3 text-sm font-bold text-white">Submit</button></div></div>}</GameShell>;
}

function GeographyGame({ close }: { close: () => void }) {
  const makeRound = () => shuffle(geographyQuestions).slice(0, 5);
  const [rounds, setRounds] = useState(makeRound);
  const [index, setIndex] = useState(0);
  const [clue, setClue] = useState(0);
  const [guess, setGuess] = useState("");
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const current = rounds[index];
  const submit = () => { if (!guess.trim()) return; const correct = guess.trim().toLowerCase() === current.answer.toLowerCase(); setScore((s) => s + (correct ? [100, 75, 50][clue] : 0)); setGuess(""); setClue(0); if (index === rounds.length - 1) setDone(true); else setIndex((i) => i + 1); };
  const nextClue = () => setClue((c) => Math.min(2, c + 1));
  const reset = () => { setRounds(makeRound()); setIndex(0); setClue(0); setGuess(""); setScore(0); setDone(false); };
  return <GameShell title="Geography Guess" subtitle="Identify places from clues" onClose={close}>{done ? <ResultScreen score={score} summary={[`${rounds.length} locations`, `${score} points`, "Early guesses earn more", "Geography knowledge + deduction"]} onAgain={reset} onExit={close} /> : <div className="mx-auto max-w-2xl"><div className="flex justify-between text-sm font-bold text-slate-500"><span>Location {index + 1} / {rounds.length}</span><span>Clue {clue + 1} · up to {100 - clue * 25} points</span></div><div className="mt-5 space-y-3">{current.clues.slice(0, clue + 1).map((c, i) => <div key={c} className="rounded-2xl bg-slate-50 p-5 text-sm font-semibold text-slate-700"><span className="mr-3 text-xs font-black uppercase text-slate-400">Clue {i + 1}</span>{c}</div>)}</div><input value={guess} onChange={(e) => setGuess(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} className="mt-5 w-full rounded-2xl border border-slate-200 px-5 py-4 font-bold outline-none focus:ring-2 focus:ring-slate-300" placeholder="Your guess..." autoFocus /><div className="mt-4 flex justify-end gap-3"><button onClick={nextClue} disabled={clue === 2} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold disabled:opacity-40">Reveal clue</button><button onClick={submit} className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white">Lock answer</button></div></div>}</GameShell>;
}

function QuizGame({ close, kind }: { close: () => void; kind: "logic" | "constitution" }) {
  const source: QuizItem[] = (kind === "logic" ? logicQuestions : constitutionQuestions) as QuizItem[];
  const makeRound = () => shuffle(source).slice(0, Math.min(5, source.length));
  const [rounds, setRounds] = useState(makeRound);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const current = rounds[index];
  const answer = (option: number) => { if (selected !== null) return; setSelected(option); if (option === current.answer) setScore((s) => s + 100); };
  const next = () => { setSelected(null); if (index === rounds.length - 1) setDone(true); else setIndex((i) => i + 1); };
  const reset = () => { setRounds(makeRound()); setIndex(0); setSelected(null); setScore(0); setDone(false); };
  const title = kind === "logic" ? "Logic Lab" : "Constitution Challenge";
  return <GameShell title={title} subtitle={kind === "logic" ? "Reasoning under pressure" : "Institutions, rights and constitutional choices"} onClose={close}>{done ? <ResultScreen score={score} summary={[`${rounds.filter((r, i) => i < rounds.length).length} questions`, `${score / 100}/${rounds.length} correct`, `${Math.round((score / (rounds.length * 100)) * 100)}% accuracy`, kind === "logic" ? "Reasoning and deduction" : "Constitutional reasoning"]} onAgain={reset} onExit={close} /> : <div className="mx-auto max-w-3xl"><div className="flex justify-between text-sm font-bold text-slate-500"><span>Question {index + 1} / {rounds.length}</span><span>{score} points</span></div><div className="mt-5 rounded-3xl bg-slate-50 p-6 sm:p-8"><p className="text-lg font-black leading-8 text-slate-950">{"q" in current ? current.q : current.scenario}</p></div><div className="mt-4 grid gap-3">{current.options.map((option, i) => <button key={String(option)} onClick={() => answer(i)} className={`rounded-2xl border p-4 text-left text-sm font-bold transition ${selected === null ? "border-slate-200 hover:-translate-y-0.5 hover:bg-slate-50" : i === current.answer ? "border-emerald-300 bg-emerald-50 text-emerald-800" : i === selected ? "border-red-300 bg-red-50 text-red-800" : "border-slate-200 opacity-60"}`}>{String(option)}</button>)}</div>{selected !== null && <div className="mt-4 rounded-2xl border border-slate-200 p-5"><p className="text-sm font-bold text-slate-700">{selected === current.answer ? "Correct." : "Not quite."}</p><p className="mt-1 text-sm text-slate-500">{current.explanation}</p><button onClick={next} className="mt-4 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white">Next</button></div>}</div>}</GameShell>;
}

function BudgetGame({ close }: { close: () => void }) {
  const [budget, setBudget] = useState(100000);
  const [alloc, setAlloc] = useState({ education: 20000, healthcare: 20000, infrastructure: 20000, environment: 15000, employment: 15000, reserve: 10000 });
  const [done, setDone] = useState(false);
  const total = Object.values(alloc).reduce((a, b) => a + b, 0);
  const score = Math.round((alloc.education * 1.2 + alloc.healthcare * 1.15 + alloc.infrastructure * 1.1 + alloc.environment * 1.25 + alloc.employment * 1.2 + alloc.reserve * 0.9) / 1000);
  const names: Record<keyof typeof alloc, string> = { education: "Education", healthcare: "Healthcare", infrastructure: "Infrastructure", environment: "Environment", employment: "Employment", reserve: "Emergency reserve" };
  const update = (key: keyof typeof alloc, value: number) => setAlloc((a) => ({ ...a, [key]: Math.max(0, Math.min(50000, value)) }));
  const finish = () => setDone(true);
  const reset = () => { setAlloc({ education: 20000, healthcare: 20000, infrastructure: 20000, environment: 15000, employment: 15000, reserve: 10000 }); setBudget(100000); setDone(false); };
  return <GameShell title="Budget Challenge" subtitle="Balance public priorities under a fixed budget" onClose={close}>{done ? <ResultScreen score={score} summary={[`₹${total.toLocaleString("en-IN")} allocated`, `${score} impact points`, `${alloc.reserve >= 15000 ? "Strong" : "Limited"} emergency resilience`, "Tradeoffs are the point"]} onAgain={reset} onExit={close} /> : <div className="mx-auto max-w-3xl"><div className="rounded-3xl bg-slate-950 p-6 text-white"><p className="text-xs font-black uppercase tracking-[0.2em] text-white/50">Available budget</p><div className="mt-2 text-4xl font-black">₹{budget.toLocaleString("en-IN")}</div><div className="mt-4"><Progress value={(total / budget) * 100} /></div><p className="mt-2 text-sm text-white/60">Allocated: ₹{total.toLocaleString("en-IN")} · Remaining: ₹{(budget - total).toLocaleString("en-IN")}</p></div><div className="mt-5 grid gap-4 sm:grid-cols-2">{(Object.keys(alloc) as (keyof typeof alloc)[]).map((key) => <label key={key} className="rounded-2xl border border-slate-200 p-4"><div className="flex justify-between text-sm font-bold"><span>{names[key]}</span><span>₹{alloc[key].toLocaleString("en-IN")}</span></div><input type="range" min="0" max="50000" step="1000" value={alloc[key]} onChange={(e) => update(key, Number(e.target.value))} className="mt-4 w-full" /></label>)}</div><button disabled={total !== budget} onClick={finish} className="mt-6 w-full rounded-2xl bg-slate-950 py-4 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-30">{total === budget ? "Submit budget" : `Allocate exactly ₹${(budget - total).toLocaleString("en-IN")} more`}</button></div>}</GameShell>;
}

function MarketGame({ close }: { close: () => void }) {
  const [price, setPrice] = useState(50);
  const [production, setProduction] = useState(1000);
  const [advertising, setAdvertising] = useState(10000);
  const [condition, setCondition] = useState(() => ["Normal demand", "Income rising", "Competition increasing", "Raw material costs rising"][Math.floor(Math.random() * 4)]);
  const [done, setDone] = useState(false);
  const demandMultiplier = condition === "Income rising" ? 1.2 : condition === "Competition increasing" ? 0.82 : condition === "Raw material costs rising" ? 0.95 : 1;
  const demand = Math.max(0, Math.round((3000 - price * 25 + advertising * 0.05) * demandMultiplier));
  const sales = Math.min(production, demand);
  const revenue = sales * price;
  const unitCost = condition === "Raw material costs rising" ? 38 : 30;
  const cost = production * unitCost + advertising;
  const profit = revenue - cost;
  const score = Math.max(0, Math.round(profit / 1000));
  const finish = () => setDone(true);
  const reset = () => { setPrice(50); setProduction(1000); setAdvertising(10000); setCondition(["Normal demand", "Income rising", "Competition increasing", "Raw material costs rising"][Math.floor(Math.random() * 4)]); setDone(false); };
  return <GameShell title="Market Simulator" subtitle="Make decisions in a changing market" onClose={close}>{done ? <ResultScreen score={score} summary={[`Revenue ₹${revenue.toLocaleString("en-IN")}`, `Profit ₹${profit.toLocaleString("en-IN")}`, `${sales.toLocaleString("en-IN")} units sold`, condition]} onAgain={reset} onExit={close} /> : <div className="mx-auto max-w-3xl"><div className="rounded-3xl bg-slate-950 p-6 text-white"><p className="text-xs font-black uppercase tracking-[0.2em] text-white/50">Market condition</p><div className="mt-2 text-2xl font-black">{condition}</div></div><div className="mt-5 grid gap-4 sm:grid-cols-3">{[["Price", price, 10, 100, setPrice], ["Production", production, 100, 3000, setProduction], ["Advertising", advertising, 0, 50000, setAdvertising]].map(([label, value, min, max, setter]) => <label key={String(label)} className="rounded-2xl border border-slate-200 p-4"><div className="flex justify-between text-sm font-bold"><span>{String(label)}</span><span>{label === "Price" ? `₹${Number(value)}` : Number(value).toLocaleString("en-IN")}</span></div><input type="range" min={Number(min)} max={Number(max)} step={label === "Price" ? 1 : 100} value={Number(value)} onChange={(e) => (setter as (n: number) => void)(Number(e.target.value))} className="mt-4 w-full" /></label>)}</div><div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">{[["Demand", demand], ["Sales", sales], ["Revenue", `₹${revenue.toLocaleString("en-IN")}`], ["Profit", `₹${profit.toLocaleString("en-IN")}`]].map(([k, v]) => <div key={String(k)} className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-black uppercase tracking-wider text-slate-400">{String(k)}</p><p className="mt-1 text-xl font-black text-slate-950">{String(v)}</p></div>)}</div><button onClick={finish} className="mt-6 w-full rounded-2xl bg-slate-950 py-4 text-sm font-black text-white">Run market decision</button></div>}</GameShell>;
}

const pieceUnicode: Record<string, string> = { wK: "♔", wQ: "♕", wR: "♖", wB: "♗", wN: "♘", wP: "♙", bK: "♚", bQ: "♛", bR: "♜", bB: "♝", bN: "♞", bP: "♟" };
type Piece = keyof typeof pieceUnicode;
type Board = (Piece | null)[][];
type QuizItem = { q?: string; scenario?: string; options: string[]; answer: number; explanation: string };
const initialBoard: Board = [
  ["bR", "bN", "bB", "bQ", "bK", "bB", "bN", "bR"], ["bP", "bP", "bP", "bP", "bP", "bP", "bP", "bP"], [null, null, null, null, null, null, null, null], [null, null, null, null, null, null, null, null], [null, null, null, null, null, null, null, null], [null, null, null, null, null, null, null, null], ["wP", "wP", "wP", "wP", "wP", "wP", "wP", "wP"], ["wR", "wN", "wB", "wQ", "wK", "wB", "wN", "wR"],
];
function colorOf(piece: Piece | null) { return piece ? piece[0] : null; }
function pseudoMoves(board: Board, r: number, c: number): [number, number][] {
  const piece = board[r][c]; if (!piece) return []; const type = piece[1]; const color = piece[0]; const out: [number, number][] = [];
  const add = (rr: number, cc: number) => { if (rr < 0 || rr > 7 || cc < 0 || cc > 7) return false; const target = board[rr][cc]; if (!target) { out.push([rr, cc]); return true; } if (colorOf(target) !== color) out.push([rr, cc]); return false; };
  if (type === "P") { const d = color === "w" ? -1 : 1; const start = color === "w" ? 6 : 1; if (r + d >= 0 && r + d <= 7 && !board[r + d][c]) { out.push([r + d, c]); if (r === start && !board[r + d * 2][c]) out.push([r + d * 2, c]); } for (const dc of [-1, 1]) { const rr = r + d, cc = c + dc; if (rr >= 0 && rr < 8 && cc >= 0 && cc < 8 && board[rr][cc] && colorOf(board[rr][cc]) !== color) out.push([rr, cc]); } return out; }
  const knight = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]; if (type === "N") { knight.forEach(([dr, dc]) => add(r + dr, c + dc)); return out; }
  const king = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]; if (type === "K") { king.forEach(([dr, dc]) => add(r + dr, c + dc)); return out; }
  const dirs: number[][] = []; if (type === "B" || type === "Q") dirs.push([-1,-1],[-1,1],[1,-1],[1,1]); if (type === "R" || type === "Q") dirs.push([-1,0],[1,0],[0,-1],[0,1]);
  dirs.forEach(([dr, dc]) => { let rr = r + dr, cc = c + dc; while (add(rr, cc)) { rr += dr; cc += dc; } }); return out;
}
function isInCheck(board: Board, color: "w" | "b") { let king: [number, number] | null = null; for (let r=0;r<8;r++) for(let c=0;c<8;c++) if(board[r][c] === `${color}K`) king=[r,c]; if(!king) return true; for(let r=0;r<8;r++) for(let c=0;c<8;c++) if(colorOf(board[r][c]) !== color && colorOf(board[r][c])) if(pseudoMoves(board,r,c).some(([rr,cc])=>rr===king![0]&&cc===king![1])) return true; return false; }
function legalMoves(board: Board, r: number, c: number): [number, number][] { const piece=board[r][c]; if(!piece) return []; const color=piece[0] as "w"|"b"; return pseudoMoves(board,r,c).filter(([rr,cc])=>{ const next=board.map(row=>[...row]); next[rr][cc]=next[r][c]; next[r][c]=null; if(piece[1]==="P"&&(rr===0||rr===7)) next[rr][cc]=`${color}Q` as Piece; return !isInCheck(next,color); }); }
function ChessGame({ close }: { close: () => void }) {
  const [board,setBoard]=useState<Board>(()=>initialBoard.map(r=>[...r])); const [turn,setTurn]=useState<"w"|"b">("w"); const [selected,setSelected]=useState<[number,number]|null>(null); const [history,setHistory]=useState<string[]>([]); const [winner,setWinner]=useState<string|null>(null);
  const moves=selected?legalMoves(board,selected[0],selected[1]):[];
  const click=(r:number,c:number)=>{ if(winner) return; const piece=board[r][c]; if(selected && moves.some(([rr,cc])=>rr===r&&cc===c)){ const next=board.map(row=>[...row]); const moving=next[selected[0]][selected[1]]!; const captured=next[r][c]; next[r][c]=moving; next[selected[0]][selected[1]]=null; if(moving[1]==="P"&&(r===0||r===7)) next[r][c]=`${moving[0]}Q` as Piece; const notation=`${moving}${String.fromCharCode(97+c)}${8-r}${captured?"×":"→"}`; const nextTurn=turn==="w"?"b":"w"; setBoard(next);setHistory(h=>[...h,notation]);setSelected(null);setTurn(nextTurn); const hasMove=next.some((row,rr)=>row.some((p,cc)=>p?.[0]===nextTurn&&legalMoves(next,rr,cc).length)); if(!hasMove) setWinner(isInCheck(next,nextTurn)?(turn==="w"?"White wins by checkmate":"Black wins by checkmate"):"Draw by stalemate"); return; } if(piece?.[0]===turn) setSelected([r,c]); else setSelected(null); };
  const reset=()=>{setBoard(initialBoard.map(r=>[...r]));setTurn("w");setSelected(null);setHistory([]);setWinner(null);};
  return <GameShell title="Chess" subtitle="Local two-player chess with legal moves" onClose={close}><div className="grid gap-7 lg:grid-cols-[minmax(0,520px)_1fr]"><div><div className="grid aspect-square overflow-hidden rounded-2xl border border-slate-300 shadow-lg">{board.map((row,r)=>row.map((piece,c)=>{const light=(r+c)%2===0;const isSel=selected?.[0]===r&&selected?.[1]===c;const can=moves.some(([rr,cc])=>rr===r&&cc===c);return <button key={`${r}-${c}`} onClick={()=>click(r,c)} className={`relative flex items-center justify-center text-3xl sm:text-5xl ${light?"bg-stone-200":"bg-stone-600"} ${isSel?"ring-4 ring-inset ring-yellow-400":""}`}>{piece&&<span className={piece[0]==="w"?"text-white drop-shadow-[0_2px_1px_rgba(0,0,0,.8)]":"text-slate-950 drop-shadow-[0_1px_1px_rgba(255,255,255,.3)]"}>{pieceUnicode[piece]}</span>}{can&&<span className="absolute h-3 w-3 rounded-full bg-slate-950/50" />}</button>}))}</div><div className="mt-4 flex items-center justify-between"><p className="text-sm font-black">{winner||`${turn==="w"?"White":"Black"} to move`}</p><button onClick={reset} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold">New game</button></div></div><div><div className="rounded-3xl bg-slate-50 p-5"><p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Move history</p><div className="mt-3 max-h-80 space-y-2 overflow-auto">{history.length?history.map((m,i)=><div key={`${m}-${i}`} className="rounded-xl bg-white px-3 py-2 text-sm font-bold text-slate-700">{i+1}. {m}</div>):<p className="text-sm text-slate-500">No moves yet.</p>}</div></div><p className="mt-4 text-xs leading-5 text-slate-500">Supports legal movement, captures, check/checkmate detection, promotion to queen and stalemate. Castling and en passant are intentionally left for the next chess engine pass rather than being faked.</p></div></div></GameShell>;
}

function UtilityModal({ tool, close }: { tool: ToolId; close: () => void }) {
  const titles: Record<ToolId,string>={calculator:"Calculator",marks:"Marks Calculator",converter:"Unit Converter",timer:"Study Timer",text:"Text Analyzer",random:"Randomizer"};
  return <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md"><div className="w-full max-w-xl rounded-[2rem] bg-white p-6 shadow-2xl sm:p-8"><div className="flex items-start justify-between"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Utility</p><h2 className="mt-1 text-2xl font-black">{titles[tool]}</h2></div><button onClick={close} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold">Close</button></div><div className="mt-6">{tool==="calculator"?<Calculator/>:tool==="marks"?<Marks/>:tool==="converter"?<Converter/>:tool==="timer"?<Timer/>:tool==="text"?<TextAnalyzer/>:<Randomizer/>}</div></div></div>;
}
function Calculator(){const [expr,setExpr]=useState("");const [result,setResult]=useState("—");const calculate=()=>{if(!/^[0-9+\-*/().%\s]+$/.test(expr))return setResult("Invalid");try{const value=Function(`"use strict"; return (${expr})`)();setResult(Number.isFinite(value)?String(value):"Invalid");}catch{setResult("Invalid");}};return <div><input value={expr} onChange={e=>setExpr(e.target.value)} onKeyDown={e=>e.key==="Enter"&&calculate()} className="w-full rounded-2xl border border-slate-200 px-5 py-4 font-mono text-lg" placeholder="(120 + 30) / 5"/><div className="mt-4 rounded-2xl bg-slate-950 p-5 text-right font-mono text-3xl font-black text-white">{result}</div><button onClick={calculate} className="mt-4 w-full rounded-xl bg-slate-950 py-3 font-bold text-white">Calculate</button></div>}
function Marks(){const [marks,setMarks]=useState(["","","","",""]);const nums=marks.map(Number).filter(n=>!Number.isNaN(n));const avg=nums.length?nums.reduce((a,b)=>a+b,0)/nums.length:0;return <div><div className="grid grid-cols-5 gap-2">{marks.map((m,i)=><input key={i} value={m} onChange={e=>setMarks(a=>a.map((x,j)=>j===i?e.target.value:x))} className="w-full rounded-xl border border-slate-200 px-2 py-3 text-center font-bold" placeholder={String(i+1)}/>)}</div><div className="mt-5 rounded-2xl bg-slate-50 p-5"><p className="text-xs font-black uppercase text-slate-400">Average</p><p className="mt-1 text-3xl font-black">{avg.toFixed(2)}</p><p className="mt-1 text-sm text-slate-500">{nums.length} subjects entered</p></div></div>}
function Converter(){const [value,setValue]=useState("1");const [mode,setMode]=useState<"km"|"c">("km");const n=Number(value);const result=mode==="km"?`${(n*0.621371).toFixed(4)} miles`:`${((n*9)/5+32).toFixed(2)} °F`;return <div><div className="flex gap-2"><input value={value} onChange={e=>setValue(e.target.value)} className="flex-1 rounded-xl border border-slate-200 px-4 py-3 font-bold"/><select value={mode} onChange={e=>setMode(e.target.value as "km"|"c")} className="rounded-xl border border-slate-200 px-4 font-bold"><option value="km">km → miles</option><option value="c">°C → °F</option></select></div><div className="mt-4 rounded-2xl bg-slate-50 p-5 text-xl font-black">{Number.isFinite(n)?result:"Enter a number"}</div></div>}
function Timer(){const [seconds,setSeconds]=useState(300);const [running,setRunning]=useState(false);useEffect(()=>{if(!running)return;const id=window.setInterval(()=>setSeconds(s=>{if(s<=1){setRunning(false);return 0}return s-1}),1000);return()=>clearInterval(id)},[running]);return <div className="text-center"><div className="font-mono text-6xl font-black">{String(Math.floor(seconds/60)).padStart(2,"0")}:{String(seconds%60).padStart(2,"0")}</div><div className="mt-5 flex justify-center gap-2"><button onClick={()=>setSeconds(300)} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold">5 min</button><button onClick={()=>setRunning(r=>!r)} className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white">{running?"Pause":"Start"}</button></div></div>}
function TextAnalyzer(){const [text,setText]=useState("");const words=text.trim()?text.trim().split(/\s+/).length:0;const sentences=text.split(/[.!?]+/).filter(Boolean).length;return <div><textarea value={text} onChange={e=>setText(e.target.value)} className="min-h-40 w-full rounded-2xl border border-slate-200 p-4" placeholder="Paste or type text..."/><div className="mt-4 grid grid-cols-3 gap-3">{[["Words",words],["Characters",text.length],["Sentences",sentences]].map(([k,v])=><div key={String(k)} className="rounded-xl bg-slate-50 p-4 text-center"><p className="text-xs font-black uppercase text-slate-400">{String(k)}</p><p className="mt-1 text-2xl font-black">{String(v)}</p></div>)}</div></div>}
function Randomizer(){const [value,setValue]=useState<number|null>(null);return <div className="text-center"><div className="text-7xl font-black">{value??"?"}</div><p className="mt-3 text-sm text-slate-500">Generate a number from 1 to 100.</p><button onClick={()=>setValue(Math.floor(Math.random()*100)+1)} className="mt-5 rounded-xl bg-slate-950 px-6 py-3 font-bold text-white">Generate</button></div>}

export default function ToolsPage(){
  const [category,setCategory]=useState<Category>("all");
  const [query,setQuery]=useState("");
  const [game,setGame]=useState<GameId|null>(null);
  const [tool,setTool]=useState<ToolId|null>(null);
  const [year,setYear]=useState(new Date().getFullYear());
  const subjectFiltered=useMemo(()=>subjectTools.filter(t=>`${t.title} ${t.description} ${t.capabilities.join(" ")}`.toLowerCase().includes(query.toLowerCase())),[query]);
  const gamesFiltered=useMemo(()=>games.filter(g=>`${g.title} ${g.tag} ${g.description}`.toLowerCase().includes(query.toLowerCase())),[query]);
  const showAcademic=category==="all"||category==="academic";
  const showUtilities=category==="all"||category==="utilities";
  const showCurrent=category==="all"||category==="current";
  const showGames=category==="all"||category==="games";
  return <main className="min-h-screen overflow-hidden bg-slate-50 text-slate-950">
    <section className="relative isolate overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 -z-10 opacity-50 [background-image:linear-gradient(rgba(255,255,255,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.06)_1px,transparent_1px)] [background-size:56px_56px]" />
      <div className="absolute -left-24 top-12 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl" /><div className="absolute right-0 top-0 h-[30rem] w-[30rem] rounded-full bg-blue-500/20 blur-3xl" />
      <div className="mx-auto max-w-7xl px-5 pb-16 pt-16 sm:px-8 lg:px-10 lg:pb-20 lg:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_.9fr]">
          <div><p className="text-xs font-black uppercase tracking-[0.35em] text-cyan-300">VGB Academic Lab</p><h1 className="mt-5 max-w-3xl text-5xl font-black tracking-[-0.05em] sm:text-6xl lg:text-7xl">Tools that make learning <span className="text-white/45">interactive.</span></h1><p className="mt-6 max-w-2xl text-base leading-7 text-white/65 sm:text-lg">Calculate. Visualize. Simulate. Explore. A practical collection of academic tools, utilities and interactive experiences built for the VidyaGyan community.</p><div className="mt-8 max-w-2xl"><div className="flex items-center rounded-2xl border border-white/10 bg-white/10 px-4 py-1 shadow-2xl backdrop-blur-xl"><span className="mr-3 text-white/40">⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} className="w-full bg-transparent py-4 text-sm font-semibold outline-none placeholder:text-white/40" placeholder="Search tools, subjects and games..." /></div></div></div>
          <div className="relative mx-auto h-80 w-full max-w-md"><div className="absolute inset-10 rounded-full border border-white/10"/><div className="absolute inset-20 rounded-full border border-white/10"/><div className="absolute left-1/2 top-1/2 flex h-32 w-32 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[2rem] border border-white/15 bg-white/10 text-center shadow-2xl backdrop-blur-xl"><div><div className="text-3xl font-black">VGB</div><div className="text-[10px] font-black uppercase tracking-[0.25em] text-white/45">Lab</div></div></div>{[["∑","20%","2%"],["⚛","72%","24%"],["🧬","22%","72%"],["◎","72%","72%"],["₹","2%","52%"],["⚖","72%","48%"]].map(([icon,left,top],i)=><div key={i} className="absolute flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-xl shadow-lg backdrop-blur-xl" style={{left,top}}>{icon}</div>)}</div>
        </div>
        <div className="mt-12 grid grid-cols-3 gap-3 border-t border-white/10 pt-6 sm:gap-8">{[["8","Academic subjects"],["6","Everyday utilities"],["8","Interactive experiences"]].map(([n,l])=><div key={l}><p className="text-2xl font-black sm:text-3xl">{n}</p><p className="mt-1 text-xs font-bold uppercase tracking-wider text-white/40 sm:text-sm">{l}</p></div>)}</div>
      </div>
    </section>

    <div className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl"><div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-5 py-3 sm:px-8 lg:px-10">{(["all","academic","utilities","current","games"] as Category[]).map(c=><button key={c} onClick={()=>setCategory(c)} className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-black uppercase tracking-wider transition ${category===c?"bg-slate-950 text-white":"text-slate-500 hover:bg-slate-100"}`}>{c==="all"?"Everything":c==="current"?"Current Affairs":c[0].toUpperCase()+c.slice(1)}</button>)}</div></div>

    <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
      {showAcademic && <section><SectionHeading eyebrow="Academic tools" title="Learn by interacting." text="Open the dedicated subject labs without duplicating their systems here."/><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{subjectFiltered.map((t,i)=><a href={t.href} key={t.href} className={`group relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl ${i===0?"xl:col-span-2 xl:row-span-2": ""}`}><div className="flex items-start justify-between"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-xl font-black text-white">{t.icon}</div><span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-500">{t.tag}</span></div><h3 className={`mt-7 font-black tracking-tight ${i===0?"text-3xl":"text-xl"}`}>{t.title}</h3><p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{t.description}</p><div className="mt-5 flex flex-wrap gap-2">{t.capabilities.map(x=><span key={x} className="rounded-full border border-slate-200 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-500">{x}</span>)}</div><div className="mt-7 text-sm font-black">Open {t.title} <span className="inline-block transition group-hover:translate-x-1">→</span></div></a>)}</div></section>}

      {showUtilities && <section className="mt-20"><SectionHeading eyebrow="Everyday tools" title="Small utilities. Less friction." text="Useful enough to keep around, simple enough not to require a user manual written by committee."/><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{([ ["calculator","∑","Calculator","Fast arithmetic and expression evaluation."],["marks","%","Marks Calculator","Average multiple subject scores."],["converter","↔","Unit Converter","Length and temperature conversions."],["timer","◷","Study Timer","Simple focused study sessions."],["text","Aa","Text Analyzer","Words, characters and sentence counts."],["random","?","Randomizer","Generate a random number from 1 to 100."] ] as [ToolId,string,string,string][]).map(([id,icon,title,desc])=><button key={id} onClick={()=>setTool(id)} className="group rounded-[1.5rem] border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"><div className="flex items-center gap-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-lg font-black">{icon}</div><div><h3 className="font-black">{title}</h3><p className="mt-1 text-xs leading-5 text-slate-500">{desc}</p></div><span className="ml-auto text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-950">→</span></div></button>)}</div></section>}

      {showCurrent && <section className="mt-20"><div className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-7 text-white shadow-xl sm:p-10"><div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl"/><div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end"><div><p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-300">Current affairs</p><h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">VGB News Desk</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-white/60">Daily India, world, economy, geopolitics, technology, public policy and other high-value current affairs. The actual news product lives on /news, where it belongs.</p></div><a href="/news" className="rounded-xl bg-white px-5 py-3 text-center text-sm font-black text-slate-950 transition hover:bg-cyan-100">Open News →</a></div></div></section>}

      {showGames && <section className="mt-20"><SectionHeading eyebrow="Interactive lab" title="Games that actually do something." text="Short challenges for reasoning, vocabulary, geography, economics, polity and strategy."/><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{gamesFiltered.map(g=><button key={g.id} onClick={()=>setGame(g.id)} className="group rounded-[1.75rem] border border-slate-200 bg-white p-6 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"><div className="flex items-start justify-between"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-xl font-black text-white">{g.icon}</div><span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{g.difficulty}</span></div><h3 className="mt-7 text-xl font-black tracking-tight">{g.title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{g.description}</p><div className="mt-5 text-xs font-black uppercase tracking-wider text-slate-400">{g.tag}</div><div className="mt-5 text-sm font-black">Play →</div></button>)}</div></section>}

      <footer className="mt-20 border-t border-slate-200 pt-8 text-sm text-slate-400"><div className="flex flex-wrap items-center justify-between gap-3"><span>VGB Academic Lab</span><span>Built for learning, experimentation and the occasional respectable distraction.</span><span>© {year} VidyaGyan</span></div></footer>
    </div>

    {game==="typing"&&<TypingGame close={()=>setGame(null)}/>} {game==="word"&&<WordGame close={()=>setGame(null)}/>} {game==="geography"&&<GeographyGame close={()=>setGame(null)}/>} {game==="logic"&&<QuizGame kind="logic" close={()=>setGame(null)}/>} {game==="constitution"&&<QuizGame kind="constitution" close={()=>setGame(null)}/>} {game==="budget"&&<BudgetGame close={()=>setGame(null)}/>} {game==="market"&&<MarketGame close={()=>setGame(null)}/>} {game==="chess"&&<ChessGame close={()=>setGame(null)}/>} {tool&&<UtilityModal tool={tool} close={()=>setTool(null)}/>} 
  </main>;
}

function SectionHeading({eyebrow,title,text}:{eyebrow:string;title:string;text:string}){return <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.28em] text-slate-400">{eyebrow}</p><h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{title}</h2></div><p className="max-w-xl text-sm leading-6 text-slate-500">{text}</p></div>}
