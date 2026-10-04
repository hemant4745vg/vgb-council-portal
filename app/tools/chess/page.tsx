"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Chess, type Color, type PieceSymbol, type Square } from "chess.js";
import { createClient } from "@/lib/supabase/client";

type Mode = "menu" | "computer" | "local" | "online";
type ComputerSide = "w" | "b";
type Difficulty = "easy" | "medium" | "hard";

type Player = {
  id: number;
  name: string;
  email: string;
  role: string | null;
};

type Challenge = {
  id: string;
  challenger_email: string;
  challenged_email: string;
  status: string;
  created_at: string;
  expires_at: string;
  game_id: string | null;
};

type OnlineGame = {
  id: string;
  white_email: string;
  black_email: string;
  status: string;
  fen: string;
  turn: Color;
  last_move: { from: string; to: string; san?: string } | null;
  winner_email: string | null;
  termination: string | null;
};

const supabase = createClient();

const PIECES: Record<Color, Record<PieceSymbol, string>> = {
  w: { k: "♔", q: "♕", r: "♖", b: "♗", n: "♘", p: "♙" },
  b: { k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟" },
};

const VALUES: Record<PieceSymbol, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];

function formatName(email: string, players: Player[]) {
  return players.find((p) => p.email.toLowerCase() === email.toLowerCase())?.name ?? email;
}

function evaluate(game: Chess) {
  let score = 0;
  for (const row of game.board()) {
    for (const piece of row) {
      if (!piece) continue;
      const value = VALUES[piece.type];
      score += piece.color === "w" ? value : -value;
    }
  }
  return score;
}

function minimax(game: Chess, depth: number, maximizing: boolean): number {
  if (depth === 0 || game.isGameOver()) return evaluate(game);

  const moves = game.moves({ verbose: true });
  if (maximizing) {
    let best = -Infinity;
    for (const move of moves) {
      game.move(move);
      best = Math.max(best, minimax(game, depth - 1, false));
      game.undo();
    }
    return best;
  }

  let best = Infinity;
  for (const move of moves) {
    game.move(move);
    best = Math.min(best, minimax(game, depth - 1, true));
    game.undo();
  }
  return best;
}

function chooseComputerMove(game: Chess, difficulty: Difficulty) {
  const moves = game.moves({ verbose: true });
  if (!moves.length) return null;

  if (difficulty === "easy") {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  const depth = difficulty === "medium" ? 1 : 2;
  const aiColor = game.turn();
  let bestScore = aiColor === "w" ? -Infinity : Infinity;
  let bestMoves: typeof moves = [];

  for (const move of moves) {
    game.move(move);
    const score = minimax(game, depth - 1, game.turn() === "w");
    game.undo();

    if (aiColor === "w") {
      if (score > bestScore) {
        bestScore = score;
        bestMoves = [move];
      } else if (score === bestScore) {
        bestMoves.push(move);
      }
    } else {
      if (score < bestScore) {
        bestScore = score;
        bestMoves = [move];
      } else if (score === bestScore) {
        bestMoves.push(move);
      }
    }
  }

  return bestMoves[Math.floor(Math.random() * bestMoves.length)] ?? moves[0];
}

function resultForGame(game: Chess) {
  if (game.isCheckmate()) {
    return game.turn() === "w" ? "Black wins by checkmate" : "White wins by checkmate";
  }
  if (game.isStalemate()) return "Draw by stalemate";
  if (game.isThreefoldRepetition()) return "Draw by repetition";
  if (game.isInsufficientMaterial()) return "Draw by insufficient material";
  if (game.isDraw()) return "Draw";
  return "";
}

function PlayerBadge({
  label,
  email,
  players,
  active,
}: {
  label: string;
  email?: string;
  players: Player[];
  active: boolean;
}) {
  return (
    <div className={`chess-player ${active ? "active" : ""}`}>
      <div className="chess-avatar">{label.slice(0, 1).toUpperCase()}</div>
      <div>
        <div className="chess-player-label">{label}</div>
        {email && <div className="chess-player-email">{formatName(email, players)}</div>}
      </div>
    </div>
  );
}

export default function ChessPage() {
  const [mode, setMode] = useState<Mode>("menu");
  const [game, setGame] = useState(() => new Chess());
  const [selected, setSelected] = useState<Square | null>(null);
  const [promotion, setPromotion] = useState<{ from: Square; to: Square } | null>(null);
  const [computerSide, setComputerSide] = useState<ComputerSide>("b");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [message, setMessage] = useState("Your move");
  const [gameResult, setGameResult] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [thinking, setThinking] = useState(false);
  const [flipped, setFlipped] = useState(false);

  const [profile, setProfile] = useState<Player | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerSearch, setPlayerSearch] = useState("");
  const [searchingPlayers, setSearchingPlayers] = useState(false);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [incomingChallenges, setIncomingChallenges] = useState<Challenge[]>([]);
  const [onlineGame, setOnlineGame] = useState<OnlineGame | null>(null);
  const [onlineError, setOnlineError] = useState("");
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetBoard = useCallback((nextMode: Mode) => {
    setMode(nextMode);
    setGame(new Chess());
    setSelected(null);
    setPromotion(null);
    setHistory([]);
    setGameResult("");
    setThinking(false);
    setMessage("Your move");
    setFlipped(false);
  }, []);

  const syncGameState = useCallback((next: Chess) => {
    setHistory(next.history());
    const result = resultForGame(next);
    if (result) {
      setGameResult(result);
      setMessage(result);
    } else if (next.inCheck()) {
      setMessage(`${next.turn() === "w" ? "White" : "Black"} is in check`);
    } else {
      setMessage(`${next.turn() === "w" ? "White" : "Black"} to move`);
    }
  }, []);

  const makeMove = useCallback(
    (from: Square, to: Square, promotionPiece?: "q" | "r" | "b" | "n") => {
      const next = new Chess(game.fen());
      try {
        next.move({ from, to, ...(promotionPiece ? { promotion: promotionPiece } : {}) });
      } catch {
        return false;
      }
      setGame(next);
      syncGameState(next);
      setSelected(null);
      setPromotion(null);
      return true;
    },
    [game, syncGameState]
  );

  const legalTargets = useMemo(() => {
    if (!selected) return new Set<string>();
    return new Set(game.moves({ square: selected, verbose: true }).map((move) => move.to));
  }, [game, selected]);

  const finishLocalGame = useCallback((winner: Color | null, termination: string) => {
    setGameResult(
      winner
        ? `${winner === "w" ? "White" : "Black"} wins • ${termination}`
        : `Draw • ${termination}`
    );
    setMessage("Game over");
  }, []);

  const resignLocal = useCallback(() => {
    if (game.isGameOver()) return;
    finishLocalGame(game.turn() === "w" ? "b" : "w", "resignation");
  }, [finishLocalGame, game]);

  const handleSquareClick = (square: Square) => {
    if (gameResult || thinking) return;

    if (mode === "online" && onlineGame && onlineGame.status !== "active") return;
    if (mode === "computer" && game.turn() === computerSide) return;

    const piece = game.get(square);

    if (!selected) {
      if (piece && piece.color === game.turn()) setSelected(square);
      return;
    }

    if (square === selected) {
      setSelected(null);
      return;
    }

    if (!legalTargets.has(square)) {
      if (piece && piece.color === game.turn()) setSelected(square);
      else setSelected(null);
      return;
    }

    const moves = game.moves({ square: selected, verbose: true });
    const move = moves.find((candidate) => candidate.to === square);
    if (!move) return;

    if (move.promotion) {
      setPromotion({ from: selected, to: square });
      return;
    }

    if (mode === "online") {
      void makeOnlineMove(selected, square);
    } else {
      makeMove(selected, square);
    }
  };

  useEffect(() => {
    if (mode !== "computer" || gameResult || game.isGameOver()) return;
    const aiTurn = game.turn() === computerSide;
    if (!aiTurn) return;

    setThinking(true);
    const timer = setTimeout(() => {
      const next = new Chess(game.fen());
      const move = chooseComputerMove(next, difficulty);
      if (move) {
        next.move(move);
        setGame(next);
        syncGameState(next);
      }
      setThinking(false);
    }, difficulty === "hard" ? 700 : 450);

    return () => clearTimeout(timer);
  }, [computerSide, difficulty, game, gameResult, mode, syncGameState]);

  useEffect(() => {
    if (mode !== "online") return;

    let cancelled = false;

    (async () => {
      const { data, error } = await supabase.rpc("get_my_portal_profile");
      if (cancelled) return;
      if (error || !data?.[0]) {
        setOnlineError("You need to be signed in to play online.");
        return;
      }

      setProfile({
        id: data[0].id,
        name: data[0].name,
        email: data[0].email,
        role: data[0].role,
      });

      const email = data[0].email;

      const { data: incoming } = await supabase
        .from("chess_challenges")
        .select("*")
        .eq("status", "pending")
        .ilike("challenged_email", email)
        .order("created_at", { ascending: false });

      if (!cancelled) setIncomingChallenges((incoming ?? []) as Challenge[]);

      const challengeChannel = supabase
        .channel(`chess-challenges-${email}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "chess_challenges" },
          (payload) => {
            const row = payload.new as Challenge;
            if (
              row &&
              (row.challenger_email?.toLowerCase() === email.toLowerCase() ||
                row.challenged_email?.toLowerCase() === email.toLowerCase())
            ) {
              setIncomingChallenges((current) => {
                if (row.status !== "pending" || row.challenged_email.toLowerCase() !== email.toLowerCase()) {
                  return current.filter((item) => item.id !== row.id);
                }
                return [row, ...current.filter((item) => item.id !== row.id)];
              });
              if (row.status === "accepted" && row.game_id) {
                loadOnlineGame(row.game_id);
              }
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(challengeChannel);
      };
    })();

    return () => {
      cancelled = true;
    };
  }, [mode]);

  const loadOnlineGame = useCallback(
    async (gameId: string) => {
      const { data, error } = await supabase
        .from("chess_games")
        .select("*")
        .eq("id", gameId)
        .single();

      if (error || !data) {
        setOnlineError(error?.message ?? "Could not load the online game.");
        return;
      }

      setOnlineGame(data as OnlineGame);
      const next = new Chess(data.fen);
      setGame(next);
      syncGameState(next);
      setFlipped(data.black_email.toLowerCase() === profile?.email.toLowerCase());
    },
    [profile?.email, syncGameState]
  );

  useEffect(() => {
    if (!onlineGame?.id) return;

    const channel = supabase
      .channel(`chess-game-${onlineGame.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "chess_games",
          filter: `id=eq.${onlineGame.id}`,
        },
        (payload) => {
          const row = payload.new as OnlineGame;
          setOnlineGame(row);
          const next = new Chess(row.fen);
          setGame(next);
          syncGameState(next);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onlineGame?.id, syncGameState]);

  useEffect(() => {
    if (mode !== "online" || !profile || !playerSearch.trim()) {
      setPlayers([]);
      return;
    }

    if (searchTimer.current) clearTimeout(searchTimer.current);
    setSearchingPlayers(true);

    searchTimer.current = setTimeout(async () => {
      const { data, error } = await supabase.rpc("search_chess_players", {
        search_text: playerSearch.trim(),
      });

      if (!error) setPlayers((data ?? []) as Player[]);
      setSearchingPlayers(false);
    }, 250);

    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [mode, playerSearch, profile]);

  const sendChallenge = async (player: Player) => {
    if (!profile) return;
    setOnlineError("");

    const { data: existing } = await supabase
      .from("chess_challenges")
      .select("id")
      .eq("challenger_email", profile.email)
      .eq("challenged_email", player.email)
      .eq("status", "pending")
      .limit(1);

    if (existing?.length) {
      setChallengeId(existing[0].id);
      return;
    }

    const { data, error } = await supabase
      .from("chess_challenges")
      .insert({
        challenger_email: profile.email,
        challenged_email: player.email,
      })
      .select()
      .single();

    if (error) {
      setOnlineError(error.message);
      return;
    }

    setChallengeId(data.id);
    setPlayerSearch("");
    setPlayers([]);
  };

  const acceptChallenge = async (challenge: Challenge) => {
    if (!profile) return;

    const challengerWhite = Math.random() >= 0.5;
    const white = challengerWhite ? challenge.challenger_email : challenge.challenged_email;
    const black = challengerWhite ? challenge.challenged_email : challenge.challenger_email;

    const initial = new Chess();

    const { data: created, error: gameError } = await supabase
      .from("chess_games")
      .insert({
        white_email: white,
        black_email: black,
        fen: initial.fen(),
        turn: "w",
      })
      .select()
      .single();

    if (gameError || !created) {
      setOnlineError(gameError?.message ?? "Could not create the game.");
      return;
    }

    const { error } = await supabase
      .from("chess_challenges")
      .update({
        status: "accepted",
        game_id: created.id,
        responded_at: new Date().toISOString(),
      })
      .eq("id", challenge.id);

    if (error) {
      setOnlineError(error.message);
      return;
    }

    setIncomingChallenges((items) => items.filter((item) => item.id !== challenge.id));
    await loadOnlineGame(created.id);
  };

  const declineChallenge = async (challenge: Challenge) => {
    await supabase
      .from("chess_challenges")
      .update({
        status: "declined",
        responded_at: new Date().toISOString(),
      })
      .eq("id", challenge.id);

    setIncomingChallenges((items) => items.filter((item) => item.id !== challenge.id));
  };

  const updateOnlineGame = async (next: Chess, move: { from: string; to: string; san?: string } | null, status = "active", winnerEmail: string | null = null, termination: string | null = null) => {
    if (!onlineGame) return;

    const { error } = await supabase
      .from("chess_games")
      .update({
        fen: next.fen(),
        turn: next.turn(),
        last_move: move,
        status,
        winner_email: winnerEmail,
        termination,
        finished_at: status === "active" ? null : new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", onlineGame.id);

    if (error) setOnlineError(error.message);
  };

  const makeOnlineMove = async (from: Square, to: Square, promotionPiece?: "q" | "r" | "b" | "n") => {
    if (!onlineGame || !profile || onlineGame.status !== "active") return;

    const myColor = onlineGame.white_email.toLowerCase() === profile.email.toLowerCase() ? "w" : "b";
    if (game.turn() !== myColor) return;

    const next = new Chess(game.fen());
    let move;
    try {
      move = next.move({ from, to, ...(promotionPiece ? { promotion: promotionPiece } : {}) });
    } catch {
      return;
    }

    const result = resultForGame(next);
    const status = next.isCheckmate()
      ? "checkmate"
      : next.isStalemate() || next.isDraw()
        ? "draw"
        : "active";

    const winner = next.isCheckmate() ? profile.email : null;
    const termination = result || null;

    setGame(next);
    syncGameState(next);
    setSelected(null);
    setPromotion(null);

    await updateOnlineGame(
      next,
      { from: move.from, to: move.to, san: move.san },
      status,
      winner,
      termination
    );
  };

  const resignOnline = async () => {
    if (!onlineGame || !profile || onlineGame.status !== "active") return;
    const opponent =
      onlineGame.white_email.toLowerCase() === profile.email.toLowerCase()
        ? onlineGame.black_email
        : onlineGame.white_email;

    const next = new Chess(game.fen());
    await updateOnlineGame(next, null, "resigned", opponent, "resignation");
    setGameResult("Game over • resignation");
  };

  const startComputer = (side: ComputerSide, level: Difficulty) => {
    setComputerSide(side);
    setDifficulty(level);
    resetBoard("computer");
  };

  const boardRows = flipped ? [...Array(8).keys()].reverse() : [...Array(8).keys()];
  const boardCols = flipped ? [...Array(8).keys()].reverse() : [...Array(8).keys()];

  const currentOnlineTurn =
    onlineGame && profile
      ? onlineGame.turn ===
        (onlineGame.white_email.toLowerCase() === profile.email.toLowerCase() ? "w" : "b")
      : false;

  return (
    <main className="chess-shell">
      <style jsx global>{`
        .chess-shell {
          min-height: 100vh;
          background:
            radial-gradient(circle at 20% 0%, rgba(59,130,246,.08), transparent 28%),
            radial-gradient(circle at 100% 20%, rgba(16,185,129,.06), transparent 24%),
            var(--background, #f8fafc);
          color: var(--foreground, #0f172a);
          padding: 28px 18px 48px;
        }
        .chess-wrap { max-width: 1180px; margin: 0 auto; }
        .chess-top { display:flex; justify-content:space-between; gap:18px; align-items:flex-end; margin-bottom:24px; }
        .chess-kicker { font-size:12px; font-weight:800; letter-spacing:.12em; text-transform:uppercase; color:#64748b; }
        .chess-title { margin:5px 0 0; font-size:clamp(30px,5vw,48px); line-height:1; letter-spacing:-.04em; font-weight:900; }
        .chess-subtitle { margin:10px 0 0; max-width:650px; color:#64748b; font-size:15px; }
        .chess-card { background:rgba(255,255,255,.82); border:1px solid rgba(148,163,184,.22); box-shadow:0 18px 55px rgba(15,23,42,.08); border-radius:24px; backdrop-filter:blur(18px); }
        .chess-menu { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; padding:18px; }
        .chess-mode { text-align:left; border:1px solid #e2e8f0; background:#fff; border-radius:20px; padding:24px; min-height:170px; cursor:pointer; transition:.18s ease; }
        .chess-mode:hover { transform:translateY(-2px); border-color:#94a3b8; box-shadow:0 12px 30px rgba(15,23,42,.08); }
        .chess-mode-icon { width:44px; height:44px; border-radius:14px; display:grid; place-items:center; background:#0f172a; color:white; font-size:22px; margin-bottom:20px; }
        .chess-mode h2 { margin:0 0 7px; font-size:20px; }
        .chess-mode p { margin:0; color:#64748b; font-size:14px; line-height:1.55; }
        .chess-game-layout { display:grid; grid-template-columns:minmax(0,760px) 330px; gap:20px; align-items:start; }
        .chess-board-card { padding:18px; }
        .chess-board { width:min(100%,720px); margin:0 auto; aspect-ratio:1; display:grid; grid-template-columns:repeat(8,1fr); overflow:hidden; border-radius:18px; box-shadow:0 18px 45px rgba(15,23,42,.18); }
        .chess-square { position:relative; border:0; display:grid; place-items:center; padding:0; cursor:pointer; font-family:Georgia,serif; font-size:clamp(31px,7vw,67px); line-height:1; }
        .chess-square.light { background:#f0d9b5; }
        .chess-square.dark { background:#b58863; }
        .chess-square.selected { box-shadow:inset 0 0 0 5px rgba(37,99,235,.7); }
        .chess-square.target::after { content:""; width:20%; aspect-ratio:1; border-radius:50%; background:rgba(15,23,42,.28); position:absolute; }
        .chess-square.capture::after { content:""; position:absolute; inset:7%; border:5px solid rgba(15,23,42,.26); border-radius:50%; }
        .chess-piece { position:relative; z-index:2; text-shadow:0 2px 2px rgba(0,0,0,.22); }
        .chess-rank, .chess-file { position:absolute; font-family:ui-sans-serif,system-ui,sans-serif; font-size:10px; font-weight:800; opacity:.72; }
        .chess-rank { top:5px; left:6px; }
        .chess-file { right:6px; bottom:5px; }
        .chess-square.light .chess-rank, .chess-square.light .chess-file { color:#b58863; }
        .chess-square.dark .chess-rank, .chess-square.dark .chess-file { color:#f0d9b5; }
        .chess-panel { padding:20px; }
        .chess-panel + .chess-panel { margin-top:14px; }
        .chess-panel h3 { margin:0 0 12px; font-size:14px; }
        .chess-status { padding:13px 14px; border-radius:14px; background:#f1f5f9; font-weight:750; font-size:14px; }
        .chess-controls { display:grid; gap:10px; }
        .chess-btn { border:1px solid #e2e8f0; background:#fff; border-radius:12px; padding:11px 13px; font-weight:750; cursor:pointer; transition:.15s; }
        .chess-btn:hover { border-color:#94a3b8; background:#f8fafc; }
        .chess-btn.primary { background:#0f172a; border-color:#0f172a; color:#fff; }
        .chess-btn.danger { color:#b91c1c; }
        .chess-select, .chess-input { width:100%; border:1px solid #e2e8f0; border-radius:12px; padding:11px 12px; background:#fff; outline:none; }
        .chess-select:focus, .chess-input:focus { border-color:#64748b; box-shadow:0 0 0 3px rgba(100,116,139,.12); }
        .chess-field { display:grid; gap:7px; margin-bottom:12px; }
        .chess-field label { font-size:12px; font-weight:800; color:#64748b; }
        .chess-player { display:flex; gap:11px; align-items:center; padding:10px; border-radius:14px; }
        .chess-player.active { background:#f1f5f9; }
        .chess-avatar { width:35px; height:35px; display:grid; place-items:center; border-radius:11px; background:#0f172a; color:white; font-weight:900; }
        .chess-player-label { font-size:11px; color:#64748b; font-weight:800; text-transform:uppercase; letter-spacing:.06em; }
        .chess-player-email { font-size:13px; font-weight:750; margin-top:2px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:220px; }
        .chess-moves { max-height:180px; overflow:auto; display:grid; gap:4px; font-size:13px; color:#475569; }
        .chess-move-row { display:grid; grid-template-columns:35px 1fr 1fr; padding:5px 7px; border-radius:8px; }
        .chess-move-row:nth-child(odd) { background:#f8fafc; }
        .chess-muted { color:#64748b; font-size:13px; line-height:1.5; }
        .chess-back { margin-bottom:14px; border:0; background:transparent; color:#64748b; font-weight:800; cursor:pointer; padding:0; }
        .chess-search-results { display:grid; gap:7px; margin-top:8px; }
        .chess-user { display:flex; justify-content:space-between; gap:10px; align-items:center; padding:10px; border:1px solid #e2e8f0; border-radius:13px; background:#fff; }
        .chess-user-name { font-weight:800; font-size:13px; }
        .chess-user-email { color:#64748b; font-size:11px; margin-top:2px; }
        .chess-challenge { display:flex; justify-content:space-between; gap:10px; align-items:center; padding:11px; border:1px solid #e2e8f0; border-radius:13px; }
        .chess-challenge + .chess-challenge { margin-top:8px; }
        .chess-actions { display:flex; gap:8px; flex-wrap:wrap; }
        .chess-actions .chess-btn { flex:1; }
        .chess-error { margin-top:10px; padding:10px 12px; border-radius:12px; background:#fef2f2; color:#991b1b; font-size:12px; font-weight:700; }
        .chess-promo { position:fixed; inset:0; background:rgba(15,23,42,.48); display:grid; place-items:center; z-index:20; padding:20px; }
        .chess-promo-card { background:#fff; padding:20px; border-radius:20px; box-shadow:0 24px 80px rgba(0,0,0,.2); }
        .chess-promo-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; margin-top:12px; }
        .chess-promo-btn { width:62px; height:62px; border:1px solid #e2e8f0; border-radius:14px; background:#fff; font-size:38px; cursor:pointer; }
        @media (max-width:900px) {
          .chess-game-layout { grid-template-columns:1fr; }
          .chess-menu { grid-template-columns:1fr; }
        }
        @media (max-width:600px) {
          .chess-shell { padding:18px 10px 34px; }
          .chess-top { align-items:flex-start; }
          .chess-board-card { padding:8px; }
          .chess-panel { padding:14px; }
          .chess-square { font-size:clamp(25px,11vw,52px); }
        }
      `}</style>

      <div className="chess-wrap">
        <div className="chess-top">
          <div>
            <div className="chess-kicker">VGB Portal • Tools</div>
            <h1 className="chess-title">Chess</h1>
            <p className="chess-subtitle">
              A focused chess room for VGB students. Play the computer, play locally, or challenge another portal account.
            </p>
          </div>
        </div>

        {mode === "menu" ? (
          <section className="chess-card chess-menu">
            <button className="chess-mode" onClick={() => startComputer("b", "medium")}>
              <div className="chess-mode-icon">♞</div>
              <h2>Play Computer</h2>
              <p>Play a built-in opponent with selectable difficulty. Legal chess rules are handled by chess.js.</p>
            </button>

            <button className="chess-mode" onClick={() => resetBoard("local")}>
              <div className="chess-mode-icon">♟</div>
              <h2>Local 2 Player</h2>
              <p>Two players, one device. Hand the device over after each move and pretend civilization has solved turn-taking.</p>
            </button>

            <button className="chess-mode" onClick={() => resetBoard("online")}>
              <div className="chess-mode-icon">♜</div>
              <h2>Play Online</h2>
              <p>Challenge another VGB Portal account and play through Supabase Realtime.</p>
            </button>
          </section>
        ) : (
          <>
            <button className="chess-back" onClick={() => { setMode("menu"); setOnlineGame(null); setChallengeId(null); }}>
              ← Back to Chess
            </button>

            {mode === "online" && !onlineGame ? (
              <section className="chess-card chess-panel">
                <h3>Play a VGB friend</h3>
                {profile ? (
                  <>
                    <p className="chess-muted">
                      Signed in as <strong>{profile.name}</strong>. Search the VGB Portal directory and send a challenge.
                    </p>

                    <div className="chess-field">
                      <label>Find a player</label>
                      <input
                        className="chess-input"
                        value={playerSearch}
                        onChange={(e) => setPlayerSearch(e.target.value)}
                        placeholder="Search by name or email"
                      />
                    </div>

                    {searchingPlayers && <div className="chess-muted">Searching…</div>}

                    <div className="chess-search-results">
                      {players.map((player) => (
                        <div className="chess-user" key={player.id}>
                          <div>
                            <div className="chess-user-name">{player.name}</div>
                            <div className="chess-user-email">{player.email}</div>
                          </div>
                          <button className="chess-btn primary" onClick={() => sendChallenge(player)}>
                            Challenge
                          </button>
                        </div>
                      ))}
                    </div>

                    {challengeId && (
                      <div className="chess-status" style={{ marginTop: 14 }}>
                        Challenge sent. Waiting for your friend to accept…
                      </div>
                    )}

                    <div style={{ marginTop: 22 }}>
                      <h3>Incoming challenges</h3>
                      {incomingChallenges.length === 0 ? (
                        <p className="chess-muted">No pending challenges.</p>
                      ) : (
                        incomingChallenges.map((challenge) => (
                          <div className="chess-challenge" key={challenge.id}>
                            <div>
                              <div className="chess-user-name">{formatName(challenge.challenger_email, players)}</div>
                              <div className="chess-user-email">{challenge.challenger_email}</div>
                            </div>
                            <div className="chess-actions">
                              <button className="chess-btn primary" onClick={() => acceptChallenge(challenge)}>Accept</button>
                              <button className="chess-btn" onClick={() => declineChallenge(challenge)}>Decline</button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {onlineError && <div className="chess-error">{onlineError}</div>}
                  </>
                ) : (
                  <p className="chess-muted">Checking your VGB Portal account…</p>
                )}
              </section>
            ) : (
              <div className="chess-game-layout">
                <section className="chess-card chess-board-card">
                  {mode === "online" && onlineGame && profile && (
                    <div style={{ marginBottom: 12 }}>
                      <PlayerBadge
                        label="Black"
                        email={onlineGame.black_email}
                        players={players}
                        active={onlineGame.turn === "b"}
                      />
                    </div>
                  )}

                  {mode !== "online" && (
                    <PlayerBadge
                      label={computerSide === "w" && mode === "computer" ? "Computer" : "White"}
                      active={game.turn() === "w"}
                      players={[]}
                    />
                  )}

                  <div className="chess-board" role="grid" aria-label="Chess board">
                    {boardRows.flatMap((rank) =>
                      boardCols.map((fileIndex) => {
                        const square = `${FILES[fileIndex]}${8 - rank}` as Square;
                        const piece = game.get(square);
                        const isSelected = selected === square;
                        const isTarget = legalTargets.has(square);
                        const isCapture = isTarget && Boolean(piece);
                        const isLastMove =
                          onlineGame?.last_move &&
                          (onlineGame.last_move.from === square || onlineGame.last_move.to === square);

                        return (
                          <button
                            key={square}
                            className={`chess-square ${(rank + fileIndex) % 2 === 0 ? "light" : "dark"} ${isSelected ? "selected" : ""} ${isTarget ? "target" : ""} ${isCapture ? "capture" : ""}`}
                            style={isLastMove ? { outline: "3px solid rgba(234,179,8,.5)", outlineOffset: "-3px" } : undefined}
                            onClick={() => handleSquareClick(square)}
                            aria-label={square}
                          >
                            {fileIndex === (flipped ? 7 : 0) && <span className="chess-rank">{8 - rank}</span>}
                            {rank === (flipped ? 0 : 7) && <span className="chess-file">{FILES[fileIndex]}</span>}
                            {piece && <span className="chess-piece">{PIECES[piece.color][piece.type]}</span>}
                          </button>
                        );
                      })
                    )}
                  </div>

                  {mode === "online" && onlineGame && profile && (
                    <div style={{ marginTop: 12 }}>
                      <PlayerBadge
                        label="White"
                        email={onlineGame.white_email}
                        players={players}
                        active={onlineGame.turn === "w"}
                      />
                    </div>
                  )}
                </section>

                <aside>
                  <section className="chess-card chess-panel">
                    <div className="chess-status">{thinking ? "Computer is thinking…" : gameResult || message}</div>

                    {mode === "online" && onlineGame && profile && (
                      <p className="chess-muted" style={{ marginTop: 10 }}>
                        {currentOnlineTurn ? "Your turn." : "Waiting for your opponent."}
                      </p>
                    )}

                    <div className="chess-controls" style={{ marginTop: 12 }}>
                      {mode === "computer" && (
                        <>
                          <div className="chess-field">
                            <label>Difficulty</label>
                            <select
                              className="chess-select"
                              value={difficulty}
                              onChange={(e) => {
                                const value = e.target.value as Difficulty;
                                setDifficulty(value);
                                resetBoard("computer");
                              }}
                            >
                              <option value="easy">Easy</option>
                              <option value="medium">Medium</option>
                              <option value="hard">Hard</option>
                            </select>
                          </div>

                          <div className="chess-field">
                            <label>You play</label>
                            <select
                              className="chess-select"
                              value={computerSide === "w" ? "black" : "white"}
                              onChange={(e) => {
                                const nextSide: ComputerSide = e.target.value === "white" ? "b" : "w";
                                setComputerSide(nextSide);
                                resetBoard("computer");
                              }}
                            >
                              <option value="white">White</option>
                              <option value="black">Black</option>
                            </select>
                          </div>
                        </>
                      )}

                      <button className="chess-btn" onClick={() => setFlipped((value) => !value)}>
                        Flip board
                      </button>

                      <button className="chess-btn" onClick={() => resetBoard(mode)}>
                        New game
                      </button>

                      {mode !== "online" && !gameResult && (
                        <button className="chess-btn danger" onClick={resignLocal}>
                          Resign
                        </button>
                      )}

                      {mode === "online" && onlineGame && !gameResult && (
                        <button className="chess-btn danger" onClick={resignOnline}>
                          Resign
                        </button>
                      )}
                    </div>
                  </section>

                  {mode === "local" && (
                    <section className="chess-card chess-panel">
                      <h3>Local game</h3>
                      <p className="chess-muted">White moves first. Pass the device after each turn.</p>
                    </section>
                  )}

                  {mode === "computer" && (
                    <section className="chess-card chess-panel">
                      <h3>Computer game</h3>
                      <p className="chess-muted">
                        Difficulty changes the search depth. The rules engine remains fully legal in every mode.
                      </p>
                    </section>
                  )}

                  <section className="chess-card chess-panel">
                    <h3>Moves</h3>
                    <div className="chess-moves">
                      {history.length === 0 ? (
                        <span className="chess-muted">No moves yet.</span>
                      ) : (
                        Array.from({ length: Math.ceil(history.length / 2) }, (_, index) => (
                          <div className="chess-move-row" key={index}>
                            <span>{index + 1}.</span>
                            <span>{history[index * 2] ?? ""}</span>
                            <span>{history[index * 2 + 1] ?? ""}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </section>
                </aside>
              </div>
            )}
          </>
        )}
      </div>

      {promotion && (
        <div className="chess-promo" onClick={() => setPromotion(null)}>
          <div className="chess-promo-card" onClick={(e) => e.stopPropagation()}>
            <strong>Choose promotion</strong>
            <div className="chess-promo-grid">
              {(["q", "r", "b", "n"] as const).map((piece) => (
                <button
                  key={piece}
                  className="chess-promo-btn"
                  onClick={() => {
                    if (mode === "online") {
                      void makeOnlineMove(promotion.from, promotion.to, piece);
                    } else {
                      makeMove(promotion.from, promotion.to, piece);
                    }
                  }}
                >
                  {PIECES[game.turn()][piece]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
