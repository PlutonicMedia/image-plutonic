import { useState, useEffect, useCallback, useRef } from 'react';

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Point = { x: number; y: number };

const GRID = 20;
const CELL = 14;
const SPEED = 120;

export function SnakeGame() {
  const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Point>({ x: 15, y: 10 });
  const [dir, setDir] = useState<Direction>('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [started, setStarted] = useState(false);
  const dirRef = useRef(dir);
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
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center justify-between w-full" style={{ maxWidth: size }}>
        <span className="text-xs font-medium text-primary-foreground/70">🐍 Snake</span>
        <span className="text-xs font-mono text-primary-foreground/70">Score: {score}</span>
      </div>
      <div
        className="relative rounded-lg border border-primary-foreground/10 overflow-hidden"
        style={{ width: size, height: size, background: 'hsl(var(--primary) / 0.3)' }}
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
          <div className="absolute inset-0 flex items-center justify-center bg-primary/60 backdrop-blur-sm">
            <button
              onClick={reset}
              className="px-4 py-2 rounded-lg bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground text-xs font-medium transition-colors"
            >
              {gameOver ? `Game Over! (${score}) — Retry` : 'Press to Play'}
            </button>
          </div>
        )}
      </div>
      <p className="text-[10px] text-primary-foreground/40">Use arrow keys to play</p>
    </div>
  );
}
