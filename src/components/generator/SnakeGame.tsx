import { useState, useEffect, useCallback, useRef } from 'react';

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Point = { x: number; y: number };

const GRID = 20;
const CELL = 14;
const SPEED = 120;
const LS_KEY = 'plutonic-snake-highscore';

function getHighScore(): number {
  try { return parseInt(localStorage.getItem(LS_KEY) || '0', 10) || 0; } catch { return 0; }
}
function setHighScore(s: number) {
  try { localStorage.setItem(LS_KEY, String(s)); } catch {}
}

export function SnakeGame() {
  const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Point>({ x: 15, y: 10 });
  const [dir, setDir] = useState<Direction>('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [started, setStarted] = useState(false);
  const [best, setBest] = useState(getHighScore);
  const dirRef = useRef(dir);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  dirRef.current = dir;

  const spawnFood = useCallback((currentSnake: Point[]): Point => {
    let p: Point;
    do {
      p = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
    } while (currentSnake.some((s) => s.x === p.x && s.y === p.y));
    return p;
  }, []);

  const reset = () => {
    const s = [{ x: 10, y: 10 }];
    setSnake(s);
    setFood(spawnFood(s));
    setDir('RIGHT');
    setGameOver(false);
    setScore(0);
    setStarted(true);
  };

  // Update high score on game over
  useEffect(() => {
    if (gameOver && score > best) {
      setBest(score);
      setHighScore(score);
    }
  }, [gameOver, score, best]);

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!started && !gameOver) { setStarted(true); }
      const map: Record<string, Direction> = { ArrowUp: 'UP', ArrowDown: 'DOWN', ArrowLeft: 'LEFT', ArrowRight: 'RIGHT' };
      const opposite: Record<Direction, Direction> = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' };
      const nd = map[e.key];
      if (nd && nd !== opposite[dirRef.current]) {
        e.preventDefault();
        setDir(nd);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [started, gameOver]);

  // Touch controls
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      touchStart.current = { x: t.clientX, y: t.clientY };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStart.current) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - touchStart.current.x;
      const dy = t.clientY - touchStart.current.y;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);
      const threshold = 20;

      if (Math.max(absDx, absDy) < threshold) return;

      if (!started && !gameOver) setStarted(true);

      const opposite: Record<Direction, Direction> = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' };
      let nd: Direction;
      if (absDx > absDy) {
        nd = dx > 0 ? 'RIGHT' : 'LEFT';
      } else {
        nd = dy > 0 ? 'DOWN' : 'UP';
      }
      if (nd !== opposite[dirRef.current]) {
        setDir(nd);
      }
      touchStart.current = null;
    };

    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [started, gameOver]);

  // Game loop
  useEffect(() => {
    if (!started || gameOver) return;
    const interval = setInterval(() => {
      setSnake((prev) => {
        const head = { ...prev[0] };
        const d = dirRef.current;
        if (d === 'UP') head.y--;
        if (d === 'DOWN') head.y++;
        if (d === 'LEFT') head.x--;
        if (d === 'RIGHT') head.x++;

        if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID || prev.some((s) => s.x === head.x && s.y === head.y)) {
          setGameOver(true);
          return prev;
        }

        const newSnake = [head, ...prev];
        if (head.x === food.x && head.y === food.y) {
          setScore((s) => s + 1);
          setFood(spawnFood(newSnake));
        } else {
          newSnake.pop();
        }
        return newSnake;
      });
    }, SPEED);
    return () => clearInterval(interval);
  }, [started, gameOver, food, spawnFood]);

  const size = GRID * CELL;

  return (
    <div className="flex flex-col items-center gap-3" ref={containerRef}>
      <div className="flex items-center justify-between w-full" style={{ maxWidth: size }}>
        <span className="text-xs font-medium text-primary-foreground/70">🐍 Snake</span>
        <div className="flex gap-3">
          <span className="text-xs font-mono text-primary-foreground/70">Score: {score}</span>
          <span className="text-xs font-mono text-primary-foreground/40">Best: {best}</span>
        </div>
      </div>
      <div
        className="relative rounded-lg border border-primary-foreground/10 overflow-hidden touch-none"
        style={{ width: size, height: size, maxWidth: '100%', background: 'hsl(var(--primary) / 0.3)' }}
      >
        {snake.map((s, i) => (
          <div
            key={i}
            className="absolute rounded-sm"
            style={{
              left: s.x * CELL,
              top: s.y * CELL,
              width: CELL - 1,
              height: CELL - 1,
              background: i === 0 ? 'hsl(var(--primary-foreground))' : 'hsl(var(--primary-foreground) / 0.7)',
            }}
          />
        ))}
        <div
          className="absolute rounded-full"
          style={{
            left: food.x * CELL + 2,
            top: food.y * CELL + 2,
            width: CELL - 4,
            height: CELL - 4,
            background: 'hsl(0 80% 60%)',
          }}
        />
        {(!started || gameOver) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-primary/60 backdrop-blur-sm gap-2">
            {gameOver && best > 0 && (
              <span className="text-xs font-mono text-primary-foreground/60">🏆 Best: {best}</span>
            )}
            <button
              onClick={reset}
              className="px-4 py-2 rounded-lg bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground text-xs font-medium transition-colors"
            >
              {gameOver ? `Game Over! (${score}) — Retry` : 'Press to Play'}
            </button>
          </div>
        )}
      </div>
      <p className="text-[10px] text-primary-foreground/40">Arrow keys or swipe to play</p>
    </div>
  );
}
