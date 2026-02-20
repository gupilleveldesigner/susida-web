import { WORDS } from './words';

// 접시 가격 및 색상
export const PLATE_TYPES: Record<number, { price: number; color: string; borderColor: string }> = {
  1000: { price: 1000, color: '#f5c518', borderColor: '#e6b800' },
  1800: { price: 1800, color: '#4caf50', borderColor: '#388e3c' },
  2400: { price: 2400, color: '#f44336', borderColor: '#d32f2f' },
  3800: { price: 3800, color: '#9e9e9e', borderColor: '#757575' },
  5000: { price: 5000, color: '#8b9b6e', borderColor: '#6b7b4e' },
};

export interface WordMix {
  len: string;
  prob: number;
}

export interface Course {
  id: string;
  title: string;
  cost: number;
  color: string;
  timeLimit: number;
  descLength: string;
  speedBase: number;
  speedVariance: number;
  wordMix: WordMix[];
  priceMix: number[];
  emoji: string;
}

export const COURSES: Record<string, Course> = {
  EASY: {
    id: 'EASY', title: '가볍게', cost: 3000, color: '#d37700',
    timeLimit: 60, descLength: '2~7글자',
    speedBase: 12, speedVariance: 2,
    wordMix: [{ len: 'short', prob: 1.0 }], priceMix: [1000, 1800],
    emoji: '🥚',
  },
  NORMAL: {
    id: 'NORMAL', title: '추천', cost: 5000, color: '#0066cc',
    timeLimit: 90, descLength: '5~10글자',
    speedBase: 9, speedVariance: 2,
    wordMix: [{ len: 'short', prob: 0.2 }, { len: 'medium', prob: 0.8 }], priceMix: [1800, 2400, 3800],
    emoji: '🍣',
  },
  HARD: {
    id: 'HARD', title: '고급', cost: 10000, color: '#cc0000',
    timeLimit: 120, descLength: '9~14글자 이상',
    speedBase: 7, speedVariance: 1.5,
    wordMix: [{ len: 'medium', prob: 0.3 }, { len: 'long', prob: 0.7 }], priceMix: [3800, 5000],
    emoji: '🍱',
  },
};

export const DIFFICULTIES = ['연습', '보통', '정확도 중시', '속도 필수', '단판 승부'];

export const SUSHI_EMOJIS = ['🍣', '🍱', '🍤', '🍙', '🍜', '🐙', '🦑', '🐟', '🦐', '🦪'];

export const COMBO_REQUIREMENT = 5;

export type GameState = 'TITLE' | 'COURSE_SELECT' | 'PLAYING' | 'END';

export interface GameItem {
  id: number;
  word: string;
  price: number;
  plateColor: string;
  plateBorder: string;
  emoji: string;
  speed: number;
}

// Re-export WORDS for consumers
export { WORDS };
