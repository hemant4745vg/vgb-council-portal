"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";

type GameId = "typing" | "word" | "logic" | "chess";
type ToolId = "marks" | "converter" | "timer" | "text" | "random";
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
  { id: "logic", icon: "∴", title: "Logic Lab", tag: "Reasoning", description: "Sequences, deduction, patterns and quantitative logic.", difficulty: "Medium" },
  { id: "chess", icon: "♞", title: "Chess", tag: "Strategy", description: "A complete local chessboard with legal play and tournament-style controls.", difficulty: "Advanced" },
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

const logicQuestions = [
  { q: "What comes next: 2, 6, 12, 20, 30, ?", options: ["36", "40", "42", "44"], answer: 2, explanation: "The differences are 4, 6, 8, 10, so the next difference is 12: 42." },
  { q: "All economists are analysts. Some analysts are writers. Which statement must be true?", options: ["All writers are economists", "Some economists are writers", "All economists are analysts", "No analysts are writers"], answer: 2, explanation: "The first statement directly establishes that every economist is an analyst." },
  { q: "A clock shows 3:00. What is the angle between the hands?", options: ["30", "60", "90", "120"], answer: 2, explanation: "At 3:00 the minute hand is at 12 and the hour hand is at 3, creating 90 degrees." },
  { q: "If CAT becomes DBU by shifting each letter forward once, DOG becomes:", options: ["EPH", "EPG", "EOG", "FPH"], answer: 0, explanation: "D→E, O→P and G→H." },
  { q: "A fair coin is tossed twice. Probability of exactly one head?", options: ["1/4", "1/2", "3/4", "1"], answer: 1, explanation: "HT and TH are two of four equally likely outcomes." },
  { q: "If some A are B and no B are C, which must be true?", options: ["Some A are not C", "All A are C", "No A are B", "Some C are B"], answer: 0, explanation: "The A elements that are B cannot be C because no B is C." },
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

function GameShell({ title, subtitle, onClose, children }: { title: string; subtitle: string; onClose: () => void; children?: ReactNode }) {
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
  return <GameShell title="Typing Race" subtitle="Speed + accuracy" onClose={close}>{done ? <ResultScreen score={Math.max(0, Math.round(wpm * accuracy / 100))} summary={[`${wpm} WPM`, `${accuracy}% accuracy`, `${correct}/${text.length} characters correct`, `${seconds}s session`]} onAgain={reset} onExit={close} /> : <div className="mx-auto max-w-3xl"><div className="flex flex-wrap items-center justify-between gap-3"><div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">{mode}s mode</span><span className="ml-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">{wpm} WPM</span></div><div className="text-sm font-black text-slate-500">{seconds}s / {mode}s</div></div><div className="mt-5 rounded-3xl bg-slate-950 p-6 text-lg font-semibold leading-8 text-white sm:p-8">{passage.split("").map((char, i) => <span key={`${char}-${i}`} className={i < text.length ? (text[i] === char ? "text-emerald-300" : "text-red-300") : "text-white/50"}>{char}</span>)}</div><textarea autoFocus value={text} disabled={done || text.length >= passage.length} onChange={(e) => { if (!started) setStarted(true); setText(e.target.value.slice(0, passage.length)); }} className="mt-5 min-h-32 w-full resize-none rounded-2xl border border-slate-200 p-5 text-base outline-none ring-slate-300 focus:ring-2" placeholder="Start typing the passage here..." /><div className="mt-4 flex items-center justify-between"><div className="w-2/3"><Progress value={(text.length / passage.length) * 100} /></div><button onClick={reset} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold">Restart</button></div><p className="mt-5 text-sm text-slate-500">Accuracy: <strong>{accuracy}%</strong> · Correct characters: <strong>{correct}</strong> · Remaining: <strong>{Math.max(0, passage.length - text.length)}</strong></p></div>}</GameShell>;
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

function QuizGame({ close }: { close: () => void }) {
  const makeRound = () => shuffle(logicQuestions).slice(0, Math.min(5, logicQuestions.length));
  const [rounds, setRounds] = useState(makeRound);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const current = rounds[index];
  const answer = (option: number) => { if (selected !== null) return; setSelected(option); if (option === current.answer) setScore((s) => s + 100); };
  const next = () => { setSelected(null); if (index === rounds.length - 1) setDone(true); else setIndex((i) => i + 1); };
  const reset = () => { setRounds(makeRound()); setIndex(0); setSelected(null); setScore(0); setDone(false); };
  return <GameShell title="Logic Lab" subtitle="Reasoning under pressure" onClose={close}>{done ? <ResultScreen score={score} summary={[`${rounds.length} questions`, `${score / 100}/${rounds.length} correct`, `${Math.round((score / (rounds.length * 100)) * 100)}% accuracy`, "Reasoning and deduction"]} onAgain={reset} onExit={close} /> : <div className="mx-auto max-w-3xl"><div className="flex justify-between text-sm font-bold text-slate-500"><span>Question {index + 1} / {rounds.length}</span><span>{score} points</span></div><div className="mt-5 rounded-3xl bg-slate-50 p-6 sm:p-8"><p className="text-lg font-black leading-8 text-slate-950">{current.q}</p></div><div className="mt-4 grid gap-3">{current.options.map((option, i) => <button key={option} onClick={() => answer(i)} className={`rounded-2xl border p-4 text-left text-sm font-bold transition ${selected === null ? "border-slate-200 hover:-translate-y-0.5 hover:bg-slate-50" : i === current.answer ? "border-emerald-300 bg-emerald-50 text-emerald-800" : i === selected ? "border-red-300 bg-red-50 text-red-800" : "border-slate-200 opacity-60"}`}>{option}</button>)}</div>{selected !== null && <div className="mt-4 rounded-2xl border border-slate-200 p-5"><p className="text-sm font-bold text-slate-700">{selected === current.answer ? "Correct." : "Not quite."}</p><p className="mt-1 text-sm text-slate-500">{current.explanation}</p><button onClick={next} className="mt-4 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white">{index === rounds.length - 1 ? "Finish" : "Next"}</button></div>}</div>}</GameShell>;
}

const pieceUnicode: Record<string, string> = { wK: "♔", wQ: "♕", wR: "♖", wB: "♗", wN: "♘", wP: "♙", bK: "♚", bQ: "♛", bR: "♜", bB: "♝", bN: "♞", bP: "♟" };
type Piece = keyof typeof pieceUnicode;
type Board = (Piece | null)[][];
type Color = "w" | "b";
type Square = [number, number];
type CastlingRights = { wK: boolean; wQ: boolean; bK: boolean; bQ: boolean };
type ChessMove = { from: Square; to: Square; promotion?: "Q" | "R" | "B" | "N"; castle?: "K" | "Q"; enPassant?: boolean };
type ChessState = { board: Board; turn: Color; castling: CastlingRights; enPassant: Square | null; halfmove: number; fullmove: number };

const initialBoard: Board = [
  ["bR", "bN", "bB", "bQ", "bK", "bB", "bN", "bR"],
  ["bP", "bP", "bP", "bP", "bP", "bP", "bP", "bP"],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ["wP", "wP", "wP", "wP", "wP", "wP", "wP", "wP"],
  ["wR", "wN", "wB", "wQ", "wK", "wB", "wN", "wR"],
];

const initialChessState = (): ChessState => ({
  board: initialBoard.map((row) => [...row]),
  turn: "w",
  castling: { wK: true, wQ: true, bK: true, bQ: true },
  enPassant: null,
  halfmove: 0,
  fullmove: 1,
});

const opposite = (color: Color): Color => color === "w" ? "b" : "w";
const colorOf = (piece: Piece | null): Color | null => piece ? piece[0] as Color : null;
const pieceType = (piece: Piece | null): string | null => piece ? piece[1] : null;
const inBounds = (r: number, c: number) => r >= 0 && r < 8 && c >= 0 && c < 8;
const cloneBoard = (board: Board): Board => board.map((row) => [...row]);

function isSquareAttacked(board: Board, targetR: number, targetC: number, by: Color) {
  const pawnRow = targetR + (by === "w" ? 1 : -1);
  for (const dc of [-1, 1]) if (inBounds(pawnRow, targetC + dc) && board[pawnRow][targetC + dc] === `${by}P`) return true;

  const knightSteps = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
  for (const [dr, dc] of knightSteps) if (inBounds(targetR + dr, targetC + dc) && board[targetR + dr][targetC + dc] === `${by}N`) return true;

  for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
    if (!dr && !dc) continue;
    const r = targetR + dr, c = targetC + dc;
    if (inBounds(r, c) && board[r][c] === `${by}K`) return true;
  }

  const rays: { dirs: number[][]; pieces: string[] }[] = [
    { dirs: [[-1,0],[1,0],[0,-1],[0,1]], pieces: ["R", "Q"] },
    { dirs: [[-1,-1],[-1,1],[1,-1],[1,1]], pieces: ["B", "Q"] },
  ];
  for (const ray of rays) for (const [dr, dc] of ray.dirs) {
    let r = targetR + dr, c = targetC + dc;
    while (inBounds(r, c)) {
      const p = board[r][c];
      if (p) {
        if (colorOf(p) === by && ray.pieces.includes(pieceType(p)!)) return true;
        break;
      }
      r += dr; c += dc;
    }
  }
  return false;
}

function kingSquare(board: Board, color: Color): Square | null {
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) if (board[r][c] === `${color}K`) return [r, c];
  return null;
}

function isInCheck(state: ChessState, color: Color) {
  const king = kingSquare(state.board, color);
  return king ? isSquareAttacked(state.board, king[0], king[1], opposite(color)) : true;
}

function pseudoMoves(state: ChessState, r: number, c: number, includeCastling = true): ChessMove[] {
  const board = state.board;
  const piece = board[r][c];
  if (!piece) return [];
  const color = colorOf(piece)!;
  const type = pieceType(piece)!;
  const out: ChessMove[] = [];
  const add = (rr: number, cc: number) => {
    if (!inBounds(rr, cc)) return false;
    const target = board[rr][cc];
    if (!target) { out.push({ from: [r, c], to: [rr, cc] }); return true; }
    if (colorOf(target) !== color && pieceType(target) !== "K") out.push({ from: [r, c], to: [rr, cc] });
    return false;
  };

  if (type === "P") {
    const d = color === "w" ? -1 : 1;
    const start = color === "w" ? 6 : 1;
    const one = r + d;
    if (inBounds(one, c) && !board[one][c]) {
      out.push({ from: [r,c], to: [one,c] });
      const two = r + d * 2;
      if (r === start && !board[two][c]) out.push({ from: [r,c], to: [two,c] });
    }
    for (const dc of [-1, 1]) {
      const rr = r + d, cc = c + dc;
      if (!inBounds(rr, cc)) continue;
      const target = board[rr][cc];
      if (target && colorOf(target) !== color && pieceType(target) !== "K") out.push({ from: [r,c], to: [rr,cc] });
      if (!target && state.enPassant?.[0] === rr && state.enPassant?.[1] === cc) out.push({ from: [r,c], to: [rr,cc], enPassant: true });
    }
    return out;
  }

  if (type === "N") {
    for (const [dr, dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]) add(r + dr, c + dc);
    return out;
  }

  if (type === "K") {
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) if (dr || dc) add(r + dr, c + dc);
    if (includeCastling && !isInCheck(state, color)) {
      const row = color === "w" ? 7 : 0;
      const enemy = opposite(color);
      const kingSide = color === "w" ? state.castling.wK : state.castling.bK;
      const queenSide = color === "w" ? state.castling.wQ : state.castling.bQ;
      if (c === 4 && kingSide && board[row][5] === null && board[row][6] === null && board[row][7] === `${color}R` && !isSquareAttacked(board,row,5,enemy) && !isSquareAttacked(board,row,6,enemy)) out.push({ from:[row,4], to:[row,6], castle:"K" });
      if (c === 4 && queenSide && board[row][1] === null && board[row][2] === null && board[row][3] === null && board[row][0] === `${color}R` && !isSquareAttacked(board,row,3,enemy) && !isSquareAttacked(board,row,2,enemy)) out.push({ from:[row,4], to:[row,2], castle:"Q" });
    }
    return out;
  }

  const dirs: number[][] = [];
  if (type === "B" || type === "Q") dirs.push([-1,-1],[-1,1],[1,-1],[1,1]);
  if (type === "R" || type === "Q") dirs.push([-1,0],[1,0],[0,-1],[0,1]);
  for (const [dr, dc] of dirs) { let rr = r + dr, cc = c + dc; while (inBounds(rr, cc)) { if (!add(rr, cc)) break; rr += dr; cc += dc; } }
  return out;
}

function applyMove(state: ChessState, move: ChessMove): ChessState {
  const board = cloneBoard(state.board);
  const moving = board[move.from[0]][move.from[1]]!;
  const color = colorOf(moving)!;
  const type = pieceType(moving)!;
  const captured = move.enPassant ? board[move.from[0]][move.to[1]] : board[move.to[0]][move.to[1]];
  board[move.from[0]][move.from[1]] = null;
  if (move.enPassant) board[move.from[0]][move.to[1]] = null;
  board[move.to[0]][move.to[1]] = move.promotion ? `${color}${move.promotion}` as Piece : moving;

  if (move.castle === "K") { board[move.to[0]][5] = board[move.to[0]][7]; board[move.to[0]][7] = null; }
  if (move.castle === "Q") { board[move.to[0]][3] = board[move.to[0]][0]; board[move.to[0]][0] = null; }

  const castling = { ...state.castling };
  if (type === "K") {
    if (color === "w") { castling.wK = false; castling.wQ = false; }
    else { castling.bK = false; castling.bQ = false; }
  }
  if (type === "R") {
    if (color === "w" && move.from[0] === 7 && move.from[1] === 0) castling.wQ = false;
    if (color === "w" && move.from[0] === 7 && move.from[1] === 7) castling.wK = false;
    if (color === "b" && move.from[0] === 0 && move.from[1] === 0) castling.bQ = false;
    if (color === "b" && move.from[0] === 0 && move.from[1] === 7) castling.bK = false;
  }
  if (captured === "wR") { if (move.to[0] === 7 && move.to[1] === 0) castling.wQ = false; if (move.to[0] === 7 && move.to[1] === 7) castling.wK = false; }
  if (captured === "bR") { if (move.to[0] === 0 && move.to[1] === 0) castling.bQ = false; if (move.to[0] === 0 && move.to[1] === 7) castling.bK = false; }

  const enPassant = type === "P" && Math.abs(move.to[0] - move.from[0]) === 2 ? [(move.to[0] + move.from[0]) / 2, move.from[1]] as Square : null;
  return { board, turn: opposite(color), castling, enPassant, halfmove: type === "P" || captured ? 0 : state.halfmove + 1, fullmove: color === "b" ? state.fullmove + 1 : state.fullmove };
}

function legalMovesForSquare(state: ChessState, r: number, c: number): ChessMove[] {
  const piece = state.board[r][c];
  if (!piece || colorOf(piece) !== state.turn) return [];
  return pseudoMoves(state, r, c).filter((move) => !isInCheck(applyMove(state, move), state.turn));
}

function allLegalMoves(state: ChessState, color = state.turn) {
  const probe = color === state.turn ? state : { ...state, turn: color };
  const out: ChessMove[] = [];
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) if (colorOf(probe.board[r][c]) === color) out.push(...legalMovesForSquare(probe, r, c));
  return out;
}

const squareName = ([r,c]: Square) => `${String.fromCharCode(97 + c)}${8-r}`;
const moveKey = (move: ChessMove) => `${move.from[0]}${move.from[1]}-${move.to[0]}${move.to[1]}-${move.promotion || ""}-${move.castle || ""}-${move.enPassant ? "ep" : ""}`;
function positionKey(state: ChessState) { return `${state.board.map(row => row.map(p => p || "-").join("")).join("/")}|${state.turn}|${state.castling.wK?"K":""}${state.castling.wQ?"Q":""}${state.castling.bK?"k":""}${state.castling.bQ?"q":""}|${state.enPassant ? state.enPassant.join("") : "-"}`; }
function insufficientMaterial(board: Board) {
  const pieces: Piece[] = []; for (const row of board) for (const p of row) if (p && !["K"].includes(pieceType(p)!)) pieces.push(p);
  if (!pieces.length) return true;
  if (pieces.length === 1 && ["B","N"].includes(pieceType(pieces[0])!)) return true;
  if (pieces.every(p => pieceType(p) === "B")) {
    const bishopSquares: number[] = []; for (let r=0;r<8;r++) for(let c=0;c<8;c++) if(board[r][c]?.[1]==="B") bishopSquares.push((r+c)%2);
    return bishopSquares.length > 0 && bishopSquares.every(v => v === bishopSquares[0]);
  }
  return false;
}

function notationForMove(state: ChessState, move: ChessMove, next: ChessState) {
  if (move.castle === "K") return isInCheck(next, next.turn) ? "O-O+" : "O-O";
  if (move.castle === "Q") return isInCheck(next, next.turn) ? "O-O-O+" : "O-O-O";
  const moving = state.board[move.from[0]][move.from[1]]!;
  const captured = move.enPassant || state.board[move.to[0]][move.to[1]];
  const type = pieceType(moving)!;
  const prefix = type === "P" ? (captured ? String.fromCharCode(97 + move.from[1]) : "") : type;
  const promo = move.promotion ? `=${move.promotion}` : "";
  const suffix = isInCheck(next, next.turn) ? (allLegalMoves(next).length ? "+" : "#") : "";
  return `${prefix}${captured ? "x" : ""}${squareName(move.to)}${promo}${suffix}`;
}

function ChessGame({ close }: { close: () => void }) {
  const [state,setState]=useState<ChessState>(()=>initialChessState());
  const [past,setPast]=useState<ChessState[]>([]);
  const [selected,setSelected]=useState<Square|null>(null);
  const [lastMove,setLastMove]=useState<ChessMove|null>(null);
  const [history,setHistory]=useState<string[]>([]);
  const [moveStack,setMoveStack]=useState<ChessMove[]>([]);
  const [positionKeys,setPositionKeys]=useState<string[]>([positionKey(initialChessState())]);
  const [promotion,setPromotion]=useState<ChessMove|null>(null);
  const [flipped,setFlipped]=useState(false);

  const selectedMoves=selected?legalMovesForSquare(state,selected[0],selected[1]):[];
  const legal=allLegalMoves(state);
  const checked=isInCheck(state,state.turn);
  const gameStatus = legal.length===0 ? (checked ? `${state.turn === "w" ? "White" : "Black"} is checkmated` : "Draw by stalemate") : state.halfmove >= 100 ? "Draw by fifty-move rule" : insufficientMaterial(state.board) ? "Draw by insufficient material" : positionKeys.filter(k=>k===positionKey(state)).length>=3 ? "Draw by threefold repetition" : null;

  const commit=(move:ChessMove)=>{
    const next=applyMove(state,move);
    const notation=notationForMove(state,move,next);
    setPast(p=>[...p,state]); setMoveStack(m=>[...m,move]); setState(next); setSelected(null); setPromotion(null); setLastMove(move); setHistory(h=>[...h,notation]); setPositionKeys(k=>[...k,positionKey(next)]);
  };
  const click=(r:number,c:number)=>{
    if(gameStatus) return;
    const piece=state.board[r][c];
    if(selected){
      const move=selectedMoves.find(m=>m.to[0]===r&&m.to[1]===c);
      if(move){
        if(pieceType(state.board[selected[0]][selected[1]])==="P" && (r===0||r===7)) { setPromotion(move); return; }
        commit(move); return;
      }
    }
    if(piece && colorOf(piece)===state.turn) setSelected([r,c]); else setSelected(null);
  };
  const undo=()=>{ if(!past.length)return; const previous=past[past.length-1]; const remainingMoves=moveStack.slice(0,-1); setPast(past.slice(0,-1)); setMoveStack(remainingMoves); setState(previous); setHistory(history.slice(0,-1)); setPositionKeys(positionKeys.slice(0,-1)); setLastMove(remainingMoves.length?remainingMoves[remainingMoves.length-1]:null); setSelected(null); setPromotion(null); };
  const reset=()=>{const fresh=initialChessState();setState(fresh);setPast([]);setMoveStack([]);setSelected(null);setLastMove(null);setHistory([]);setPositionKeys([positionKey(fresh)]);setPromotion(null);};
  const displayRows=flipped?[7,6,5,4,3,2,1,0]:[0,1,2,3,4,5,6,7];
  const displayCols=flipped?[7,6,5,4,3,2,1,0]:[0,1,2,3,4,5,6,7];
  const displaySquares: Square[]=[];
  displayRows.forEach((r)=>displayCols.forEach((c)=>displaySquares.push([r,c])));

  return <GameShell title="Chess" subtitle="Complete local two-player chess · legal play · no shortcuts" onClose={close}>
    <div className="grid gap-7 xl:grid-cols-[minmax(0,620px)_340px]">
      <div>
        <div className="mb-4 flex items-center justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-300/70">{state.fullmove} · {state.turn === "w" ? "White" : "Black"} to move</p><p className={`mt-1 text-sm font-bold ${checked?"text-rose-400":"text-white/45"}`}>{checked ? "King in check" : gameStatus || "Position stable"}</p></div><button onClick={()=>setFlipped(v=>!v)} className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/55 hover:text-white">Flip board</button></div>
        <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#0b172a] p-2 shadow-[0_30px_90px_rgba(0,0,0,.35)]">
          <div className="grid aspect-square grid-cols-8 overflow-hidden rounded-xl">
            {displaySquares.map(([r,c],squareIndex)=>{const ri=Math.floor(squareIndex/8);const ci=squareIndex%8;const piece=state.board[r][c];const light=(r+c)%2===0;const isSel=selected?.[0]===r&&selected?.[1]===c;const can=selectedMoves.some(m=>m.to[0]===r&&m.to[1]===c);const isLast=lastMove && ((lastMove.from[0]===r&&lastMove.from[1]===c)||(lastMove.to[0]===r&&lastMove.to[1]===c));const isKingCheck=piece===`${state.turn}K`&&checked;return <button key={`${r}-${c}`} onClick={()=>click(r,c)} aria-label={`${squareName([r,c])}${piece?` ${piece}`:" empty"}`} className={`relative flex items-center justify-center transition ${light?"bg-[#d8e1e5]":"bg-[#547187]"} ${isLast?"after:absolute after:inset-0 after:bg-cyan-300/20":""} ${isSel?"ring-2 ring-inset ring-cyan-300":""} ${isKingCheck?"ring-2 ring-inset ring-rose-400":""}`}>
              {ci===0&&<span className={`absolute left-1 top-1 z-20 text-[8px] font-black ${light?"text-[#547187]/60":"text-white/55"}`}>{8-r}</span>}{ri===7&&<span className={`absolute bottom-1 right-1 z-20 text-[8px] font-black ${light?"text-[#547187]/60":"text-white/55"}`}>{String.fromCharCode(97+c)}</span>}
              {piece&&<span className={`relative z-10 select-none text-[2.25rem] leading-none sm:text-[3.6rem] ${piece[0]==="w"?"text-white drop-shadow-[0_3px_2px_rgba(0,0,0,.55)]":"text-[#172231] drop-shadow-[0_2px_1px_rgba(255,255,255,.25)]"}`}>{pieceUnicode[piece]}</span>}
              {can&&<span className={`absolute z-20 rounded-full ${state.board[r][c]?"h-2.5 w-2.5 border-2 border-slate-950/50 bg-transparent":"h-3 w-3 bg-slate-950/30"}`} />}
            </button>})}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2"><button onClick={undo} disabled={!past.length} className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-white/55 disabled:opacity-25">Undo</button><button onClick={reset} className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-white/55 hover:text-white">New game</button></div>
      </div>
      <aside className="space-y-3">
        <div className="border border-white/10 bg-white/[0.025] p-5"><p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/25">Game status</p><p className="mt-2 text-xl font-black text-white">{gameStatus || `${state.turn === "w" ? "White" : "Black"} to move`}</p><div className="mt-4 grid grid-cols-2 gap-2"><div className="border border-white/10 bg-black/10 p-3"><p className="text-[8px] font-black uppercase tracking-wider text-white/25">Halfmove</p><p className="mt-1 font-mono text-sm text-white/70">{state.halfmove}</p></div><div className="border border-white/10 bg-black/10 p-3"><p className="text-[8px] font-black uppercase tracking-wider text-white/25">Moves</p><p className="mt-1 font-mono text-sm text-white/70">{history.length}</p></div></div></div>
        <div className="border border-white/10 bg-white/[0.025] p-5"><div className="flex items-center justify-between"><p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/25">Move ledger</p><span className="text-[9px] font-mono text-white/20">{history.length}</span></div><div className="mt-3 max-h-[330px] space-y-1.5 overflow-auto pr-1">{history.length?history.map((_,i)=>i).filter((i)=>i%2===0).map((i)=><div key={i} className="grid grid-cols-[32px_1fr_1fr] border border-white/[0.06] bg-black/10 px-3 py-2 text-xs"><span className="font-mono text-white/20">{i/2+1}.</span><span className="font-bold text-white/65">{history[i]||""}</span><span className="font-bold text-white/45">{history[i+1]||""}</span></div>):<p className="py-8 text-center text-xs text-white/25">The board is waiting.</p>}</div></div>
        <div className="border border-cyan-200/10 bg-cyan-200/[0.025] p-5"><p className="text-[9px] font-black uppercase tracking-[0.25em] text-cyan-200/45">Engine features</p><div className="mt-3 flex flex-wrap gap-1.5">{["Castling","En passant","Promotion","Check","Checkmate","Stalemate","Undo","Repetition"].map(x=><span key={x} className="border border-white/10 px-2 py-1 text-[8px] font-black uppercase tracking-wider text-white/40">{x}</span>)}</div></div>
      </aside>
    </div>
    {promotion&&<div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"><div className="w-full max-w-sm border border-white/10 bg-[#0b172a] p-6 shadow-2xl"><p className="text-[9px] font-black uppercase tracking-[0.25em] text-cyan-300/70">Promotion</p><h3 className="mt-2 text-2xl font-black text-white">Choose your piece</h3><div className="mt-5 grid grid-cols-4 gap-2">{(["Q","R","B","N"] as const).map(p=><button key={p} onClick={()=>commit({...promotion,promotion:p})} className="border border-white/10 bg-white/[0.04] p-4 text-4xl text-white hover:border-cyan-200/40 hover:bg-cyan-200/[0.08]">{pieceUnicode[`${state.turn}${p}`]}</button>)}</div></div></div>}
  </GameShell>;
}

function UtilityModal({ tool, close }: { tool: ToolId; close: () => void }) {
  const titles: Record<ToolId,string>={marks:"Marks Calculator",converter:"Unit Converter",timer:"Study Timer",text:"Text Analyzer",random:"Randomizer"};
  return <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md"><div className="w-full max-w-xl rounded-[2rem] bg-white p-6 shadow-2xl sm:p-8"><div className="flex items-start justify-between"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Utility</p><h2 className="mt-1 text-2xl font-black">{titles[tool]}</h2></div><button onClick={close} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold">Close</button></div><div className="mt-6">{tool==="marks"?<Marks/>:tool==="converter"?<Converter/>:tool==="timer"?<Timer/>:tool==="text"?<TextAnalyzer/>:<Randomizer/>}</div></div></div>;
}
function Marks(){const [marks,setMarks]=useState(["","","","",""]);const nums=marks.map(Number).filter(n=>!Number.isNaN(n));const avg=nums.length?nums.reduce((a,b)=>a+b,0)/nums.length:0;return <div><div className="grid grid-cols-5 gap-2">{marks.map((m,i)=><input key={i} value={m} onChange={e=>setMarks(a=>a.map((x,j)=>j===i?e.target.value:x))} className="w-full rounded-xl border border-slate-200 px-2 py-3 text-center font-bold" placeholder={String(i+1)}/>)}</div><div className="mt-5 rounded-2xl bg-slate-50 p-5"><p className="text-xs font-black uppercase text-slate-400">Average</p><p className="mt-1 text-3xl font-black">{avg.toFixed(2)}</p><p className="mt-1 text-sm text-slate-500">{nums.length} subjects entered</p></div></div>}
function Converter(){
  const [value,setValue]=useState("1");
  const [category,setCategory]=useState<"length"|"mass"|"area"|"volume"|"speed"|"time"|"temperature"|"data">("length");
  const unitSets={
    length:{"mm":1,"cm":10,"m":1000,"km":1000000,"in":25.4,"ft":304.8,"yd":914.4,"mi":1609344},
    mass:{"mg":1,"g":1000,"kg":1000000,"t":1000000000,"oz":28349.523125,"lb":453592.37},
    area:{"mm²":1,"cm²":100,"m²":1000000,"km²":1000000000000,"ft²":92903.04,"acre":4046856.4224,"ha":100000000},
    volume:{"mL":1,"L":1000,"m³":1000000,"cm³":1,"gal":3785.411784,"ft³":28316.846592},
    speed:{"m/s":1,"km/h":0.2777777778,"mph":0.44704,"knot":0.5144444444},
    time:{"ms":1,"s":1000,"min":60000,"h":3600000,"day":86400000},
    temperature:{"°C":0,"°F":1,"K":2},
    data:{"B":1,"KB":1024,"MB":1048576,"GB":1073741824,"TB":1099511627776},
  } as const;
  const units=unitSets[category];
  const unitKeys=Object.keys(units) as string[];
  const [from,setFrom]=useState(unitKeys[0]); const [to,setTo]=useState(unitKeys[1]||unitKeys[0]); const n=Number(value);
  useEffect(()=>{const keys=Object.keys(unitSets[category]) as string[];setFrom(keys[0]);setTo(keys[1]||keys[0]);},[category]);
  const convertTemperature=(x:number,a:string,b:string)=>{let c=a==="°C"?x:a==="°F"?(x-32)*5/9:x-273.15;return b==="°C"?c:b==="°F"?c*9/5+32:c+273.15;};
  const result=category==="temperature"?convertTemperature(n,from,to):n*((units as Record<string,number>)[from] / (units as Record<string,number>)[to]);
  return <div><div className="grid gap-3 sm:grid-cols-3"><select value={category} onChange={e=>setCategory(e.target.value as typeof category)} className="rounded-xl border border-slate-200 px-4 py-3 font-bold sm:col-span-1"><option value="length">Length</option><option value="mass">Mass</option><option value="area">Area</option><option value="volume">Volume</option><option value="speed">Speed</option><option value="time">Time</option><option value="temperature">Temperature</option><option value="data">Data</option></select><input value={value} onChange={e=>setValue(e.target.value)} className="rounded-xl border border-slate-200 px-4 py-3 font-bold" placeholder="Enter value"/><div className="flex gap-2"><select value={from} onChange={e=>setFrom(e.target.value)} className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-3 font-bold">{unitKeys.map(u=><option key={u}>{u}</option>)}</select><select value={to} onChange={e=>setTo(e.target.value)} className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-3 font-bold">{unitKeys.map(u=><option key={u}>{u}</option>)}</select></div></div><div className="mt-4 rounded-2xl bg-slate-50 p-5"><p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Result</p><p className="mt-1 break-all text-2xl font-black">{Number.isFinite(n)?`${Number(result.toFixed(8))} ${to}`:"Enter a number"}</p></div></div>}

function formatTwo(value:number){return value<10?`0${value}`:String(value)}
function Timer(){const [seconds,setSeconds]=useState(300);const [running,setRunning]=useState(false);useEffect(()=>{if(!running)return;const id=window.setInterval(()=>setSeconds(s=>{if(s<=1){setRunning(false);return 0}return s-1}),1000);return()=>clearInterval(id)},[running]);return <div className="text-center"><div className="font-mono text-6xl font-black">{formatTwo(Math.floor(seconds/60))}:{formatTwo(seconds%60)}</div><div className="mt-5 flex justify-center gap-2"><button onClick={()=>setSeconds(300)} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold">5 min</button><button onClick={()=>setRunning(r=>!r)} className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white">{running?"Pause":"Start"}</button></div></div>}
function TextAnalyzer(){const [text,setText]=useState("");const words=text.trim()?text.trim().split(/\s+/).length:0;const sentences=text.split(/[.!?]+/).filter(Boolean).length;return <div><textarea value={text} onChange={e=>setText(e.target.value)} className="min-h-40 w-full rounded-2xl border border-slate-200 p-4" placeholder="Paste or type text..."/><div className="mt-4 grid grid-cols-3 gap-3">{[["Words",words],["Characters",text.length],["Sentences",sentences]].map(([k,v])=><div key={String(k)} className="rounded-xl bg-slate-50 p-4 text-center"><p className="text-xs font-black uppercase text-slate-400">{String(k)}</p><p className="mt-1 text-2xl font-black">{String(v)}</p></div>)}</div></div>}
function Randomizer(){const [value,setValue]=useState<number|null>(null);return <div className="text-center"><div className="text-7xl font-black">{value??"?"}</div><p className="mt-3 text-sm text-slate-500">Generate a number from 1 to 100.</p><button onClick={()=>setValue(Math.floor(Math.random()*100)+1)} className="mt-5 rounded-xl bg-slate-950 px-6 py-3 font-bold text-white">Generate</button></div>}


function SubjectArtwork({ index }: { index: number }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.2, opacity: 0.22 };
  return (
    <svg viewBox="0 0 320 170" className="absolute inset-0 h-full w-full text-sky-300" aria-hidden="true">
      {index === 0 && <>
        <path d="M-10 118 C45 90 72 72 111 94 S172 151 211 116 S245 35 276 43 S307 94 330 75" {...common} strokeWidth="2" opacity="0.3" />
        <path d="M0 132 C48 109 77 94 112 105 S169 142 211 125 S260 70 320 96" {...common} />
        <circle cx="110" cy="94" r="4" fill="currentColor" opacity="0.35" />
        <circle cx="211" cy="116" r="4" fill="currentColor" opacity="0.35" />
      </>}
      {index === 1 && <>
        <ellipse cx="164" cy="88" rx="86" ry="37" transform="rotate(8 164 88)" {...common} />
        <ellipse cx="164" cy="88" rx="56" ry="91" transform="rotate(42 164 88)" {...common} />
        <circle cx="164" cy="88" r="12" fill="currentColor" opacity="0.08" />
        <circle cx="242" cy="83" r="4" fill="currentColor" opacity="0.35" />
      </>}
      {index === 2 && <>
        <circle cx="161" cy="84" r="28" {...common} />
        <circle cx="161" cy="84" r="11" {...common} />
        <path d="M161 56 L161 20 M133 84 L97 84 M189 84 L225 84 M141 64 L116 39 M181 64 L206 39 M141 104 L116 129 M181 104 L206 129" {...common} />
        <circle cx="97" cy="84" r="5" fill="currentColor" opacity="0.28" />
        <circle cx="225" cy="84" r="5" fill="currentColor" opacity="0.28" />
      </>}
      {index === 3 && <>
        <path d="M58 94 C42 61 69 42 98 58 C126 74 131 111 160 109 C190 107 189 56 221 58 C253 60 263 94 251 116" {...common} strokeWidth="2" />
        <path d="M49 96 C69 112 91 118 111 101 C136 80 143 49 166 50 C193 51 193 103 219 105 C238 107 251 92 263 78" {...common} />
        <circle cx="111" cy="101" r="4" fill="currentColor" opacity="0.3" />
        <circle cx="219" cy="105" r="4" fill="currentColor" opacity="0.3" />
      </>}
      {index === 4 && <>
        <path d="M18 42 L154 112 L302 39" {...common} strokeWidth="2" />
        <path d="M17 128 L154 58 L303 129" {...common} />
        <circle cx="154" cy="85" r="5" fill="currentColor" opacity="0.35" />
        <circle cx="18" cy="42" r="3" fill="currentColor" opacity="0.25" />
        <circle cx="302" cy="39" r="3" fill="currentColor" opacity="0.25" />
      </>}
      {index === 5 && <>
        <ellipse cx="157" cy="86" rx="105" ry="48" {...common} />
        <ellipse cx="157" cy="86" rx="79" ry="35" {...common} />
        <ellipse cx="157" cy="86" rx="51" ry="24" {...common} />
        <path d="M157 86 C184 74 202 73 224 81 C244 88 263 87 281 77" {...common} />
      </>}
      {index === 6 && <>
        <path d="M60 28 V142 M60 92 C91 92 95 72 122 72 C151 72 150 110 181 110 C212 110 213 51 255 51" {...common} strokeWidth="2" />
        <path d="M60 122 C104 122 110 103 145 103 C178 103 190 126 225 126 C254 126 272 106 295 91" {...common} />
        <circle cx="181" cy="110" r="4" fill="currentColor" opacity="0.28" />
      </>}
      {index === 7 && <>
        <path d="M32 52 L157 122 L289 47" {...common} />
        <path d="M32 118 L157 48 L289 123" {...common} />
        <circle cx="157" cy="85" r="18" fill="currentColor" opacity="0.08" />
        <circle cx="32" cy="52" r="5" fill="currentColor" opacity="0.3" />
        <circle cx="289" cy="47" r="5" fill="currentColor" opacity="0.3" />
      </>}
    </svg>
  );
}

function GameArtwork({ index }: { index: number }) {
  return (
    <svg viewBox="0 0 320 170" className="absolute inset-0 h-full w-full text-cyan-200/25" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.2">
        {index === 0 && <>
          <path d="M25 118 H295" />
          <path d="M48 118 L92 78 L126 103 L177 45 L218 83 L278 34" />
          <circle cx="177" cy="45" r="5" />
        </>}
        {index === 1 && <>
          <path d="M54 108 L92 61 L133 105 L171 54 L213 105 L257 63" />
          <path d="M70 124 H250" />
        </>}
        {index === 2 && <>
          <circle cx="160" cy="85" r="54" />
          <path d="M160 31 V139 M106 85 H214" />
          <path d="M123 48 L197 122 M197 48 L123 122" />
        </>}
        {index === 3 && <>
          <path d="M38 106 C77 50 111 50 151 95 S223 135 282 56" />
          <circle cx="151" cy="95" r="5" />
          <circle cx="282" cy="56" r="5" />
        </>}
        {index === 4 && <>
          <rect x="72" y="42" width="176" height="100" rx="12" />
          <path d="M72 76 H248 M112 42 V142 M160 42 V142 M208 42 V142" />
        </>}
        {index === 5 && <>
          <path d="M55 117 L104 64 L153 116 L202 51 L267 118" />
          <circle cx="104" cy="64" r="5" />
          <circle cx="202" cy="51" r="5" />
        </>}
        {index === 6 && <>
          <path d="M54 52 C88 52 88 118 122 118 C156 118 156 52 190 52 C224 52 224 118 258 118" />
          <path d="M54 88 H258" />
        </>}
        {index === 7 && <>
          <path d="M45 104 L106 43 L164 97 L223 54 L282 108" />
          <circle cx="106" cy="43" r="6" />
          <circle cx="223" cy="54" r="6" />
        </>}
      </g>
    </svg>
  );
}

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
  return <main className="min-h-screen overflow-hidden bg-[#071426] text-white">
    <section className="relative isolate overflow-hidden border-b border-white/[0.08] bg-[#071426]">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_75%_30%,rgba(53,110,177,.18),transparent_28%),radial-gradient(circle_at_18%_72%,rgba(19,104,137,.12),transparent_25%)]" />
      <div className="absolute inset-0 -z-10 opacity-50 [background-image:linear-gradient(rgba(130,170,220,.055)_1px,transparent_1px),linear-gradient(90deg,rgba(130,170,220,.055)_1px,transparent_1px)] [background-size:52px_52px]" />
      <div className="absolute right-[-12rem] top-[-12rem] -z-10 h-[34rem] w-[34rem] rounded-full border border-cyan-200/[0.08] shadow-[0_0_140px_rgba(59,130,246,.08)]" />
      <div className="absolute left-[-8rem] bottom-[-13rem] -z-10 h-[28rem] w-[28rem] rounded-full border border-cyan-200/[0.06]" />

      <div className="mx-auto max-w-[1440px] px-5 pb-14 pt-10 sm:px-8 lg:px-12 lg:pb-20 lg:pt-14">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-5">
          <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.32em] text-white/45"><span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,.8)]" /> VGB Academic Lab</div>
          <div className="hidden text-[10px] font-black uppercase tracking-[0.28em] text-white/30 sm:block">Tools / Games / Experiments</div>
        </div>

        <div className="grid items-end gap-12 pt-14 lg:grid-cols-[1.05fr_.95fr] lg:pt-20">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.36em] text-cyan-300/80">01 / The Lab</p>
            <h1 className="mt-5 max-w-4xl text-5xl font-black leading-[0.94] tracking-[-0.065em] sm:text-6xl lg:text-[6.4rem]">Tools &amp;<br /><span className="text-white/35">Games.</span></h1>
            <p className="mt-7 max-w-2xl text-sm leading-7 text-white/55 sm:text-base">A focused collection of academic workspaces, practical utilities and interactive challenges built to make learning feel less like a worksheet and more like a system.</p>
            <div className="mt-8 flex max-w-2xl items-center border border-white/[0.11] bg-white/[0.035] px-4 shadow-2xl shadow-black/20 transition focus-within:border-cyan-200/30 focus-within:bg-white/[0.055]">
              <span className="mr-3 text-sm text-white/30">⌕</span>
              <input value={query} onChange={e=>setQuery(e.target.value)} className="w-full bg-transparent py-4 text-xs font-bold uppercase tracking-[0.08em] text-white outline-none placeholder:text-white/25" placeholder="Search the lab..." />
              <span className="hidden border-l border-white/10 pl-3 text-[9px] font-black uppercase tracking-[0.2em] text-white/20 sm:block">Search</span>
            </div>
          </div>

          <div className="relative mx-auto hidden h-[360px] w-full max-w-[520px] lg:block">
            <div className="absolute left-1/2 top-1/2 h-[270px] w-[270px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.07]" />
            <div className="absolute left-1/2 top-1/2 h-[190px] w-[190px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.07]" />
            <div className="absolute left-1/2 top-1/2 h-[110px] w-[110px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/15 bg-cyan-300/[0.035] shadow-[0_0_70px_rgba(34,211,238,.08)]" />
            <div className="absolute left-1/2 top-1/2 h-px w-[90%] -translate-x-1/2 bg-gradient-to-r from-transparent via-cyan-200/20 to-transparent" />
            <div className="absolute left-1/2 top-1/2 w-px h-[90%] -translate-y-1/2 bg-gradient-to-b from-transparent via-cyan-200/15 to-transparent" />
            {[['∑','10%','18%'],['⚛','72%','11%'],['◎','84%','58%'],['⚖','12%','68%'],['₹','48%','6%'],['Aa','60%','82%']].map(([icon,left,top],i)=><div key={i} className="absolute flex h-11 w-11 items-center justify-center border border-white/[0.10] bg-[#0b1c34]/80 text-sm font-black text-white/70 shadow-xl backdrop-blur-md" style={{left,top}}>{icon}</div>)}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center"><p className="text-4xl font-black tracking-[-0.06em]">VGB</p><p className="mt-1 text-[9px] font-black uppercase tracking-[0.35em] text-white/30">Learning systems</p></div>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-3 border-t border-white/[0.08] pt-6 sm:mt-20 sm:grid-cols-4">
          {[['08','Academic subjects'],['05','Utility systems'],['04','Interactive games'],['01','News desk']].map(([n,l])=><div key={l} className="border-r border-white/[0.07] px-3 first:pl-0 last:border-0 sm:px-6"><p className="text-xl font-black tracking-tight sm:text-2xl">{n}</p><p className="mt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-white/30 sm:text-[10px]">{l}</p></div>)}
        </div>
      </div>
    </section>

    <div className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#071426]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1440px] gap-1 overflow-x-auto px-5 py-3 sm:px-8 lg:px-12">
        {(['all','academic','utilities','current','games'] as Category[]).map(c=><button key={c} onClick={()=>setCategory(c)} className={`relative whitespace-nowrap px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] transition ${category===c?'text-white':'text-white/30 hover:text-white/70'}`}>{c==='all'?'Index':c==='current'?'Current Affairs':c}<span className={`absolute bottom-0 left-4 right-4 h-px bg-cyan-300 transition ${category===c?'opacity-100':'opacity-0'}`} /></button>)}
      </div>
    </div>

    <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
      {showAcademic && <section>
        <div className="mb-9 flex items-end justify-between gap-6 border-b border-white/[0.08] pb-5">
          <div><p className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-300/70">02 / Academic systems</p><h2 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl">Subject Labs</h2></div>
          <p className="hidden max-w-md text-right text-xs leading-6 text-white/35 md:block">Eight dedicated environments for calculation, visualization, simulation, mapping and structured study.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {subjectFiltered.map((t,i)=><a href={t.href} key={t.href} className="group relative min-h-[252px] overflow-hidden border border-[#203653] bg-[#0b1b34] p-5 transition duration-500 hover:-translate-y-1 hover:border-cyan-200/30 hover:bg-[#0d213d] hover:shadow-[0_20px_70px_rgba(0,0,0,.28)]">
            <div className="absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100 bg-[radial-gradient(circle_at_70%_45%,rgba(70,170,220,.09),transparent_34%)]" />
            <SubjectArtwork index={i} />
            <div className="relative z-10 flex items-start justify-between">
              <span className="text-[9px] font-black tracking-[0.25em] text-white/30">{formatTwo(i+1)}</span>
              <span className="text-sm text-white/30 transition duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-cyan-200">↗</span>
            </div>
            <div className="relative z-10 mt-11 flex h-8 w-8 items-center justify-center border border-cyan-100/20 bg-cyan-200/[0.035] text-sm font-black text-cyan-100/80">{t.icon}</div>
            <div className="relative z-10 mt-4"><h3 className="text-[18px] font-black tracking-[-0.02em] text-white">{t.title}</h3><p className="mt-2 max-w-[255px] text-[11px] leading-5 text-white/38">{t.description}</p></div>
            <div className="absolute bottom-5 left-5 right-5 z-10 flex items-center justify-between"><span className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-200/75">Open tool</span><span className="text-[9px] font-black uppercase tracking-[0.18em] text-white/20">{t.tag}</span></div>
          </a>)}
        </div>
      </section>}

      {showUtilities && <section className="mt-20">
        <div className="mb-9 flex items-end justify-between gap-6 border-b border-white/[0.08] pb-5"><div><p className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-300/70">03 / Utility systems</p><h2 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl">Everyday Tools</h2></div><p className="hidden text-xs text-white/30 md:block">Small systems. Immediate output.</p></div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {([['marks','%','Marks Calculator','Average multiple subject scores.'],['converter','↔','Unit Converter','Length, mass, area, volume, speed, time, temperature and data.'],['timer','◷','Study Timer','Simple focused study sessions.'],['text','Aa','Text Analyzer','Words, characters and sentence counts.'],['random','?','Randomizer','Generate a random number from 1 to 100.']] as [ToolId,string,string,string][]).map(([id,icon,title,desc],i)=><button key={id} onClick={()=>setTool(id)} className="group relative overflow-hidden border border-[#203653] bg-[#0b1b34] p-5 text-left transition duration-300 hover:border-cyan-200/25 hover:bg-[#0d213d]"><div className="flex items-center gap-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center border border-white/[0.09] bg-white/[0.025] text-sm font-black text-cyan-100/80">{icon}</div><div className="min-w-0"><h3 className="text-sm font-black text-white">{title}</h3><p className="mt-1 text-[10px] leading-5 text-white/35">{desc}</p></div><span className="ml-auto text-white/20 transition group-hover:translate-x-1 group-hover:text-cyan-200">↗</span></div><span className="absolute bottom-0 left-0 h-px w-0 bg-cyan-300/60 transition-all duration-500 group-hover:w-full" /></button>)}
        </div>
      </section>}

      {showCurrent && <section className="mt-20">
        <div className="relative overflow-hidden border border-[#203653] bg-[#0b1b34] p-7 sm:p-10"><div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_center,rgba(37,160,210,.09),transparent_60%)]" /><div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-300/70">04 / Current affairs</p><h2 className="mt-3 text-3xl font-black tracking-[-0.04em]">VGB News Desk</h2><p className="mt-3 max-w-2xl text-xs leading-6 text-white/35">Daily India, world, economy, geopolitics, technology, public policy and other high-value current affairs.</p></div><a href="/news" className="border border-cyan-200/20 bg-cyan-200/[0.06] px-5 py-3 text-center text-[10px] font-black uppercase tracking-[0.2em] text-cyan-100 transition hover:bg-cyan-200/10">Open news ↗</a></div></div>
      </section>}

      {showGames && <section className="mt-20">
        <div className="mb-9 flex items-end justify-between gap-6 border-b border-white/[0.08] pb-5"><div><p className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-300/70">05 / Interactive systems</p><h2 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl">Game Lab</h2></div><p className="hidden max-w-md text-right text-xs leading-6 text-white/35 md:block">Speed, vocabulary, reasoning and serious strategy. Four focused experiences, with Chess as the flagship.</p></div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {gamesFiltered.map((g,i)=><button key={g.id} onClick={()=>setGame(g.id)} className="group relative min-h-[230px] overflow-hidden border border-[#203653] bg-[#0b1b34] p-5 text-left transition duration-500 hover:-translate-y-1 hover:border-cyan-200/30 hover:bg-[#0d213d] hover:shadow-[0_20px_70px_rgba(0,0,0,.28)]"><GameArtwork index={i} /><div className="relative z-10 flex items-start justify-between"><span className="text-[9px] font-black tracking-[0.25em] text-white/30">G.{formatTwo(i+1)}</span><span className="text-sm text-white/25 transition group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-cyan-200">↗</span></div><div className="relative z-10 mt-12"><h3 className="text-[18px] font-black tracking-[-0.02em] text-white">{g.title}</h3><p className="mt-2 max-w-[260px] text-[11px] leading-5 text-white/38">{g.description}</p></div><div className="absolute bottom-5 left-5 right-5 z-10 flex items-center justify-between"><span className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-200/75">Launch</span><span className="text-[9px] font-black uppercase tracking-[0.18em] text-white/20">{g.difficulty} · {g.tag}</span></div></button>)}
        </div>
      </section>}

      <footer className="mt-20 border-t border-white/[0.08] pt-7 text-[10px] font-bold uppercase tracking-[0.14em] text-white/20"><div className="flex flex-wrap items-center justify-between gap-3"><span>VGB Academic Lab</span><span>Learning / Experimentation / Play</span><span>© {year} VidyaGyan</span></div></footer>
    </div>

    {game==="typing"&&<TypingGame close={()=>setGame(null)}/>} {game==="word"&&<WordGame close={()=>setGame(null)}/>} {game==="logic"&&<QuizGame close={()=>setGame(null)}/>} {game==="chess"&&<ChessGame close={()=>setGame(null)}/>} {tool&&<UtilityModal tool={tool} close={()=>setTool(null)}/>}
  </main>;
}
