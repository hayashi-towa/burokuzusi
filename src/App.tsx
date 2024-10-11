import React, { useState, useEffect, useCallback } from 'react';
import GameCanvas from './components/GameCanvas';
import { Ball, Paddle, Block, Item, GameState } from './types';

const PADDLE_WIDTH = 75;
const PADDLE_HEIGHT = 10;
const BALL_RADIUS = 5;
const BLOCK_WIDTH = 48;
const BLOCK_HEIGHT = 20;
const ITEM_SIZE = 20;

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('start');
  const [score, setScore] = useState(0);
  const [difficulty, setDifficulty] = useState(1);
  const [balls, setBalls] = useState<Ball[]>([]);
  const [paddle, setPaddle] = useState<Paddle>({
    x: 240 - PADDLE_WIDTH / 2,
    y: 620,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
  });
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [items, setItems] = useState<Item[]>([]);

  const initializeGame = useCallback(() => {
    const newBalls: Ball[] = [{
      x: 240,
      y: 600,
      dx: (Math.random() - 0.5) * 4,
      dy: -3 - difficulty,
      radius: BALL_RADIUS,
    }];

    const newBlocks: Block[] = [];
    const blockRows = 5 + difficulty;
    const blockCols = 9;
    const blockColors = ['#ff4d4d', '#ff8c1a', '#ffd11a', '#4dff4d', '#bf4dff'];

    for (let i = 0; i < blockRows; i++) {
      for (let j = 0; j < blockCols; j++) {
        newBlocks.push({
          x: j * (BLOCK_WIDTH + 5) + 5,
          y: i * (BLOCK_HEIGHT + 5) + 5,
          width: BLOCK_WIDTH,
          height: BLOCK_HEIGHT,
          color: blockColors[i % blockColors.length],
          visible: true,
        });
      }
    }

    setBalls(newBalls);
    setBlocks(newBlocks);
    setItems([]);
    setScore(0);
    setPaddle({
      x: 240 - PADDLE_WIDTH / 2,
      y: 620,
      width: PADDLE_WIDTH,
      height: PADDLE_HEIGHT,
    });
  }, [difficulty]);

  const updateGameState = useCallback(() => {
    if (gameState !== 'playing') return;

    // Update ball positions
    setBalls(prevBalls => prevBalls.map(ball => {
      let { x, y, dx, dy } = ball;
      x += dx;
      y += dy;

      // Wall collision
      if (x + ball.radius > 480 || x - ball.radius < 0) dx = -dx;
      if (y - ball.radius < 0) dy = -dy;

      // Paddle collision
      if (y + ball.radius > paddle.y && x > paddle.x && x < paddle.x + paddle.width) {
        dy = -Math.abs(dy);
        dx = ((x - (paddle.x + paddle.width / 2)) / (paddle.width / 2)) * 5;
      }

      // Game over condition
      if (y + ball.radius > 640) {
        setGameState('gameOver');
      }

      return { ...ball, x, y, dx, dy };
    }));

    // Update block collisions
    let newBlocks = [...blocks];
    let scoreIncrease = 0;
    let newItems: Item[] = [];

    setBalls(prevBalls => prevBalls.map(ball => {
      let { x, y, dx, dy } = ball;
      
      newBlocks.forEach((block, index) => {
        if (block.visible &&
            x + ball.radius > block.x &&
            x - ball.radius < block.x + block.width &&
            y + ball.radius > block.y &&
            y - ball.radius < block.y + block.height
        ) {
          dy = -dy;
          newBlocks[index] = { ...block, visible: false };
          scoreIncrease += 10 * difficulty;

          if (Math.random() < 0.2) {
            newItems.push({
              x: block.x + block.width / 2 - ITEM_SIZE / 2,
              y: block.y + block.height,
              width: ITEM_SIZE,
              height: ITEM_SIZE,
              type: Math.random() < 0.5 ? 'expand' : 'multiball',
            });
          }
        }
      });

      return { ...ball, dy };
    }));

    setBlocks(newBlocks);
    setScore(prevScore => prevScore + scoreIncrease);
    setItems(prevItems => [...prevItems, ...newItems]);

    // Update items
    setItems(prevItems => prevItems.filter(item => {
      item.y += 2;
      if (
        item.y + item.height > paddle.y &&
        item.x + item.width > paddle.x &&
        item.x < paddle.x + paddle.width
      ) {
        if (item.type === 'expand') {
          setPaddle(prevPaddle => ({ ...prevPaddle, width: prevPaddle.width * 1.5 }));
          setTimeout(() => setPaddle(prevPaddle => ({ ...prevPaddle, width: PADDLE_WIDTH })), 10000);
        } else if (item.type === 'multiball') {
          setBalls(prevBalls => [
            ...prevBalls,
            ...prevBalls.map(ball => ({ ...ball, dx: -ball.dx })),
          ]);
        }
        return false;
      }
      return item.y <= 640;
    }));

    // Check if all blocks are destroyed
    if (newBlocks.every(block => !block.visible)) {
      setGameState('gameOver');
    }
  }, [gameState, paddle, blocks, difficulty]);

  useEffect(() => {
    if (gameState === 'playing') {
      const gameLoop = setInterval(updateGameState, 1000 / 60);
      return () => clearInterval(gameLoop);
    }
  }, [gameState, updateGameState]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (gameState === 'playing') {
      const canvasRect = e.currentTarget.getBoundingClientRect();
      const mouseX = e.clientX - canvasRect.left;
      setPaddle(prevPaddle => ({
        ...prevPaddle,
        x: Math.max(0, Math.min(480 - prevPaddle.width, mouseX - prevPaddle.width / 2)),
      }));
    }
  }, [gameState]);

  const startGame = useCallback((diff: number) => {
    setDifficulty(diff);
    initializeGame();
    setGameState('playing');
  }, [initializeGame]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-4">ブロック崩しゲーム</h1>
      <div onMouseMove={handleMouseMove}>
        <GameCanvas balls={balls} paddle={paddle} blocks={blocks} items={items} score={score} />
      </div>
      {gameState === 'start' && (
        <div className="mt-4">
          <button onClick={() => startGame(1)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2">
            簡単
          </button>
          <button onClick={() => startGame(2)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2">
            普通
          </button>
          <button onClick={() => startGame(3)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            難しい
          </button>
        </div>
      )}
      {gameState === 'gameOver' && (
        <div className="mt-4">
          <h2 className="text-2xl font-bold mb-2">ゲームオーバー</h2>
          <p className="mb-4">スコア: {score}</p>
          <button onClick={() => setGameState('start')} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            メインメニューに戻る
          </button>
        </div>
      )}
    </div>
  );
};

export default App;