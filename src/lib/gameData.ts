// === 한국어 단어 풀 ===
export const WORDS: Record<string, string[]> = {
  short: [
    '학교', '가방', '하늘', '바다', '우주', '별빛', '구름', '나무', '사과', '포도',
    '의자', '책상', '시계', '거울', '사진', '우산', '기차', '자석', '안경', '냉면',
    '지구', '미소', '풍선', '도시', '양말', '음악', '색깔', '연필', '종이', '계단',
    '강아지', '고양이', '토끼', '거북이', '호랑이', '사자', '코끼리',
    '아버지', '어머니', '선생님', '친구', '동생', '형제', '자매',
  ],
  medium: [
    '스마트폰', '컴퓨터', '모니터', '냉장고', '선풍기', '이어폰', '도서관', '박물관',
    '운동장', '놀이터', '수목원', '미술관', '오토바이', '지하철', '경찰관',
    '소방관', '우체국', '병원', '약국', '체육관', '수영장',
    '롤러코스터', '에스컬레이터', '엘리베이터', '편의점', '백화점',
    '무궁화꽃', '태극기', '해바라기', '민들레꽃', '장미꽃',
    '수학여행', '졸업식', '운동회', '생일파티', '문화센터',
  ],
  long: [
    '인공지능로봇', '데이터베이스', '프로그래밍', '소프트웨어', '오케스트라',
    '아메리카노', '프라푸치노', '스테이크정식', '크림스파게티', '고객센터상담원',
    '유튜브크리에이터', '블록체인기술', '자율주행자동차', '우주왕복선',
    '대한민국만세', '한국관광공사', '정보통신기술', '문화체육관광부',
    '인터넷방송국', '전자상거래', '소셜네트워크', '가상현실체험',
    '증강현실기술', '기계학습알고리즘', '국립과학박물관',
  ]
};

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
  }
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
