import React, { useRef, useEffect } from 'react';
import { Ball, Paddle, Block, Item } from '../types';

interface GameCanvasProps {
  balls: Ball[];
  paddle: Paddle;
  blocks: Block[];
  items: Item[];
  score: number;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ balls, paddle, blocks, items, score }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw balls
    balls.forEach(ball => {
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'white';
      ctx.fill();
      ctx.closePath();
    });

    // Draw paddle
    ctx.fillStyle = '#4d89ff';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

    // Draw blocks
    blocks.forEach(block => {
      if (block.visible) {
        ctx.fillStyle = block.color;
        ctx.fillRect(block.x, block.y, block.width, block.height);
      }
    });

    // Draw items
    items.forEach(item => {
      ctx.fillStyle = item.type === 'expand' ? '#00ff00' : '#ff00ff';
      ctx.fillRect(item.x, item.y, item.width, item.height);
    });

    // Draw score
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
  }, [balls, paddle, blocks, items, score]);

  return <canvas ref={canvasRef} width={480} height={640} className="border-2 border-blue-500" />;
};

export default GameCanvas;