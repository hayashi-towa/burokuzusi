export interface Ball {
  x: number;
  y: number;
  dx: number;
  dy: number;
  radius: number;
}

export interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Block {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  visible: boolean;
}

export interface Item {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'expand' | 'multiball';
}

export type GameState = 'start' | 'playing' | 'gameOver';