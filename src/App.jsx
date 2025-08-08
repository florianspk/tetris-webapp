import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Grid size
const COLS = 10;
const ROWS = 20;

// Tetromino definitions (4x4 matrices)
const TETROMINOES = {
  I: [
    [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
  ],
  J: [
    [2, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 2, 2, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 2, 0, 0, 0, 0, 0],
    [0, 2, 0, 0, 0, 2, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0],
  ],
  L: [
    [0, 0, 3, 0, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 3, 0, 0, 0, 3, 0, 0, 0, 3, 3, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 3, 3, 3, 0, 3, 0, 0, 0, 0, 0, 0, 0],
    [3, 3, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0],
  ],
  O: [[0, 4, 4, 0, 0, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
  S: [
    [0, 5, 5, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 5, 0, 0, 0, 5, 5, 0, 0, 0, 5, 0, 0, 0, 0, 0],
  ],
  T: [
    [0, 6, 0, 0, 6, 6, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 6, 0, 0, 0, 6, 6, 0, 0, 6, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 6, 6, 6, 0, 0, 6, 0, 0, 0, 0, 0, 0],
    [0, 6, 0, 0, 6, 6, 0, 0, 0, 6, 0, 0, 0, 0, 0, 0],
  ],
  Z: [
    [7, 7, 0, 0, 0, 7, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 7, 0, 0, 7, 7, 0, 0, 7, 0, 0, 0, 0, 0, 0],
  ],
};

const TET_KEYS = Object.keys(TETROMINOES);

function makeEmptyGrid() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

function randomPiece() {
  const key = TET_KEYS[Math.floor(Math.random() * TET_KEYS.length)];
  return { type: key, rot: 0, x: Math.floor((COLS - 4) / 2), y: -1 };
}

function getShapeCells(piece) {
  const shapes = TETROMINOES[piece.type];
  const matrix = shapes[piece.rot % shapes.length];
  const size = Math.sqrt(matrix.length);
  const cells = [];
  for (let i = 0; i < matrix.length; i++) {
    if (matrix[i]) {
      const dx = i % size;
      const dy = Math.floor(i / size);
      cells.push({ x: piece.x + dx, y: piece.y + dy, v: matrix[i] });
    }
  }
  return cells;
}

function collides(grid, piece) {
  const cells = getShapeCells(piece);
  for (const c of cells) {
    if (c.x < 0 || c.x >= COLS) return true;
    if (c.y >= ROWS) return true;
    if (c.y >= 0 && grid[c.y][c.x]) return true;
  }
  return false;
}

function placePiece(grid, piece) {
  const newGrid = grid.map((r) => r.slice());
  for (const c of getShapeCells(piece)) {
    if (c.y >= 0 && c.y < ROWS && c.x >= 0 && c.x < COLS)
      newGrid[c.y][c.x] = pieceToIndex(piece.type);
  }
  return newGrid;
}

function pieceToIndex(type) {
  return { I: 1, J: 2, L: 3, O: 4, S: 5, T: 6, Z: 7 }[type];
}

function clearLines(grid) {
  let lines = 0;
  const newGrid = grid.filter((row) => {
    if (row.every((cell) => cell !== 0)) {
      lines++;
      return false;
    }
    return true;
  });
  while (newGrid.length < ROWS) newGrid.unshift(Array(COLS).fill(0));
  return { grid: newGrid, lines };
}

const STORAGE_KEY = "tetris_leaderboard_v1";

const UnicornAnimation = () => {
  const [position, setPosition] = useState({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setPosition({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: position.x, y: position.y }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        position: "absolute",
        fontSize: "48px",
      }}
    >
      🦄
    </motion.div>
  );
};

const PieceLandedAnimation = () => {
  const [position, setPosition] = useState({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setPosition({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ scale: 0.5, x: position.x, y: position.y }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 10 }}
      style={{
        position: "absolute",
        fontSize: "24px",
      }}
    >
      🎉
    </motion.div>
  );
};

export default function App() {
  const [grid, setGrid] = useState(makeEmptyGrid);
  const [piece, setPiece] = useState(randomPiece);
  const [nextPiece, setNextPiece] = useState(randomPiece);
  const [dropInterval, setDropInterval] = useState(700);
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [leaderboard, setLeaderboard] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  });
  const [showUnicorn, setShowUnicorn] = useState(false);
  const [showPieceLanded, setShowPieceLanded] = useState(false);
  const dropRef = useRef();

  dropRef.current = {
    drop: () => {
      if (!running) return;
      movePiece(0, 1);
    },
  };

  useEffect(() => {
    function onKey(e) {
      if (!running && !gameOver) return;
      if (e.key === "ArrowLeft") movePiece(-1, 0);
      if (e.key === "ArrowRight") movePiece(1, 0);
      if (e.key === "ArrowDown") movePiece(0, 1, true);
      if (e.code === "Space") rotatePiece();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [running, gameOver, piece, grid]);

  useEffect(() => {
    let id;
    if (running) {
      id = setInterval(() => dropRef.current.drop(), dropInterval);
    }
    return () => clearInterval(id);
  }, [running, dropInterval]);

  useEffect(() => {
    // update level based on lines
    const lvl = Math.floor(lines / 10);
    setLevel(lvl);
    setDropInterval(Math.max(100, 700 - lvl * 60));
  }, [lines]);

  function start() {
    setGrid(makeEmptyGrid());
    setPiece(randomPiece());
    setNextPiece(randomPiece());
    setScore(0);
    setLines(0);
    setLevel(0);
    setRunning(true);
    setGameOver(false);
  }

  function movePiece(dx, dy, soft = false) {
    const p = { ...piece, x: piece.x + dx, y: piece.y + dy };
    if (!collides(grid, p)) {
      setPiece(p);
    } else {
      if (dy === 1) {
        // landed
        const landedGrid = placePiece(grid, piece);
        const res = clearLines(landedGrid);
        setGrid(res.grid);
        if (res.lines > 0) {
          const points = [0, 40, 100, 300, 1200];
          setScore((s) => s + (points[res.lines] || 0) * (level + 1));
          setLines((l) => l + res.lines);
        }
        const next = nextPiece;
        // position next at spawn
        const spawn = { ...next, x: Math.floor((COLS - 4) / 2), y: -1, rot: 0 };
        if (collides(landedGrid, spawn)) {
          // game over
          setRunning(false);
          setGameOver(true);
        } else {
          setPiece(spawn);
          setNextPiece(randomPiece());
          setShowPieceLanded(true);
          setTimeout(() => setShowPieceLanded(false), 500);
        }
      }
    }
    if (soft && !collides(grid, p)) {
      setScore((s) => s + 1);
    }
  }

  function rotatePiece() {
    const p = { ...piece, rot: piece.rot + 1 };
    if (!collides(grid, p)) setPiece(p);
    else {
      // wall kick simple: try left/right
      const pLeft = { ...p, x: p.x - 1 };
      const pRight = { ...p, x: p.x + 1 };
      if (!collides(grid, pLeft)) setPiece(pLeft);
      else if (!collides(grid, pRight)) setPiece(pRight);
    }
  }

  function renderCell(r, c) {
    const v = grid[r][c];
    return (
      <div key={`${r}-${c}`} className={`cell ${v ? "tet-" + v : "empty"}`} />
    );
  }

  function renderTempGrid() {
    // draw a merged view of grid + current piece
    const merged = grid.map((row) => row.slice());
    for (const c of getShapeCells(piece)) {
      if (c.y >= 0 && c.y < ROWS && c.x >= 0 && c.x < COLS)
        merged[c.y][c.x] = pieceToIndex(piece.type);
    }
    return merged;
  }

  function saveScore(name) {
    const entry = {
      name: name || "Anon",
      score,
      date: new Date().toISOString(),
    };
    const newLb = [...leaderboard, entry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    setLeaderboard(newLb);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newLb));
  }

  function handleSubmitScore(e) {
    e.preventDefault();
    const name = e.target.elements.name.value.trim() || "Anon";
    saveScore(name);
    e.target.elements.name.value = "";
  }

  function clearLines(grid) {
    let lines = 0;
    const newGrid = grid.filter((row) => {
      if (row.every((cell) => cell !== 0)) {
        lines++;
        return false;
      }
      return true;
    });
    while (newGrid.length < ROWS) newGrid.unshift(Array(COLS).fill(0));

    if (lines > 0) {
      setShowUnicorn(true);
      setTimeout(() => setShowUnicorn(false), 1000);
    }

    return { grid: newGrid, lines };
  }

  return (
    <div className="app">
      <div className="board">
        <div style={{ display: "flex", gap: 12 }}>
          <div>
            <div
              className="grid"
              style={{
                gridTemplateColumns: `repeat(${COLS},30px)`,
                gridAutoRows: "30px",
              }}
            >
              {renderTempGrid().map((row, r) =>
                row.map((_, c) => {
                  const v = renderTempGrid()[r][c];
                  return (
                    <div
                      key={`${r}-${c}`}
                      className={`cell ${v ? "tet-" + v : "empty"}`}
                    ></div>
                  );
                }),
              )}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showUnicorn && <UnicornAnimation />}
        {showPieceLanded && <PieceLandedAnimation />}
      </AnimatePresence>

      <div className="panel">
        <div className="h2">Tetris</div>
        <div className="score-row">
          <div>Score</div>
          <div>{score}</div>
        </div>
        <div className="score-row">
          <div>Lines</div>
          <div>{lines}</div>
        </div>
        <div className="score-row">
          <div>Level</div>
          <div>{level}</div>
        </div>

        <div style={{ marginTop: 12 }}>
          <div className="h2">Next</div>
          <div
            className="next-grid"
            style={{
              gridTemplateColumns: "repeat(4,28px)",
              gridAutoRows: "28px",
            }}
          >
            {(() => {
              const temp = Array.from({ length: 16 }).fill(0);
              const shapes = TETROMINOES[nextPiece.type];
              const matrix = shapes[0]; // Always use base rotation for preview
              const size = Math.sqrt(matrix.length);
              matrix.forEach((v, i) => {
                if (v) temp[i] = v;
              });
              return temp.map((v, i) => (
                <div key={i} className={`cell ${v ? "tet-" + v : "empty"}`} />
              ));
            })()}
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <div className="h2">Controls</div>
          <div className="controls">
            <div>← → : Move</div>
            <div>↓ : Soft drop</div>
            <div>Space : Rotate</div>
            <div style={{ marginTop: 8 }}>
              {!running && !gameOver && (
                <button className="btn" onClick={start}>
                  Start
                </button>
              )}
              {running && (
                <button className="btn" onClick={() => setRunning(false)}>
                  Pause
                </button>
              )}
              {!running && !gameOver && (
                <button
                  className="btn"
                  onClick={() => {
                    setGrid(makeEmptyGrid());
                    setScore(0);
                    setLines(0);
                  }}
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <div className="h2">Leaderboard</div>
          <div className="leaderboard">
            {leaderboard.length === 0 && (
              <div style={{ color: "#94a3b8" }}>No scores yet</div>
            )}
            {leaderboard.map((l, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "6px 0",
                }}
              >
                <div>
                  {i + 1}. {l.name}
                </div>
                <div>{l.score}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="footer">
          Tip: press Space to rotate. Leaderboard is local to your browser.
        </div>
      </div>

      {gameOver && (
        <div className="panel">
          <h3>Game Over</h3>
          <div>Score: {score}</div>
          <form onSubmit={handleSubmitScore} style={{ marginTop: 8 }}>
            <input name="name" className="input" placeholder="Your name" />
            <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
              <button className="btn" type="submit">
                Save score
              </button>
              <button
                className="btn"
                type="button"
                onClick={() => {
                  setGameOver(false);
                  start();
                }}
              >
                Play again
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
