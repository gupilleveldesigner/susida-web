'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  WORDS, PLATE_TYPES, COURSES, DIFFICULTIES, SUSHI_EMOJIS,
  COMBO_REQUIREMENT,
  type GameState, type GameItem, type Course,
} from '@/lib/gameData';

export default function SusidaGame() {
  const [gameState, setGameState] = useState<GameState>('TITLE');
  const [selectedDifficulty, setSelectedDifficulty] = useState('보통');
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);

  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalGameTime, setTotalGameTime] = useState(0);
  const [currentItem, setCurrentItem] = useState<GameItem | null>(null);
  const [inputText, setInputText] = useState('');

  const [correctKeys, setCorrectKeys] = useState(0);
  const [mistypes, setMistypes] = useState(0);
  const [plateCounts, setPlateCounts] = useState<Record<number, number>>({
    1000: 0, 1800: 0, 2400: 0, 3800: 0, 5000: 0
  });

  const [combo, setCombo] = useState(0);
  const [showComboBonus, setShowComboBonus] = useState(false);
  const [comboSeconds, setComboSeconds] = useState(0);
  const [inputKey, setInputKey] = useState(0); // Force remount input to reset Korean IME

  const inputRef = useRef<HTMLInputElement>(null);
  const itemIdCounter = useRef(0);
  const isComposing = useRef(false); // Track Korean IME composition state

  // Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'PLAYING') {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setGameState('END');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState]);

  // Auto-focus input
  useEffect(() => {
    if (gameState === 'PLAYING' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameState, currentItem, combo, timeLeft]);

  // ESC shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState === 'END' && e.key === 'Escape' && currentCourse) {
        startGame(currentCourse.id);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, currentCourse]);

  const weightedRandom = useCallback((items: { len: string; prob: number }[]) => {
    const r = Math.random();
    let cumulative = 0;
    for (const item of items) {
      cumulative += item.prob;
      if (r <= cumulative) return item.len;
    }
    return items[0].len;
  }, []);

  const spawnNextItem = useCallback(() => {
    if (!currentCourse) return;

    const wordList = WORDS[weightedRandom(currentCourse.wordMix)];
    const selectedWord = wordList[Math.floor(Math.random() * wordList.length)];
    const selectedPrice = currentCourse.priceMix[Math.floor(Math.random() * currentCourse.priceMix.length)];
    const plateInfo = PLATE_TYPES[selectedPrice];

    setCurrentItem({
      id: itemIdCounter.current++,
      word: selectedWord,
      price: plateInfo.price,
      plateColor: plateInfo.color,
      plateBorder: plateInfo.borderColor,
      emoji: SUSHI_EMOJIS[Math.floor(Math.random() * SUSHI_EMOJIS.length)],
      speed: currentCourse.speedBase + (Math.random() * currentCourse.speedVariance),
    });

    setInputText('');
  }, [currentCourse, weightedRandom]);

  const startGame = (courseId: string) => {
    const course = COURSES[courseId];
    if (!course) return;
    setCurrentCourse(course);
    setGameState('PLAYING');
    setScore(0);
    setCombo(0);
    setCorrectKeys(0);
    setMistypes(0);
    setPlateCounts({ 1000: 0, 1800: 0, 2400: 0, 3800: 0, 5000: 0 });
    setTimeLeft(course.timeLimit);
    setTotalGameTime(course.timeLimit);
    setCurrentItem(null);
    itemIdCounter.current = 0;
  };

  useEffect(() => {
    if (gameState === 'PLAYING' && currentCourse && !currentItem) {
      spawnNextItem();
    }
  }, [gameState, currentCourse, currentItem, spawnNextItem]);

  const handleCompositionStart = () => {
    isComposing.current = true;
  };

  const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
    isComposing.current = false;
    // Trigger input handling after composition ends
    handleInputValue((e.target as HTMLInputElement).value);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Skip during Korean IME composition - wait for compositionend
    if (isComposing.current) {
      setInputText(e.target.value);
      return;
    }
    handleInputValue(e.target.value);
  };

  const handleInputValue = (value: string) => {
    if (!currentItem) {
      setInputText(value);
      return;
    }

    // Word completed
    if (value === currentItem.word) {
      const remainingKeys = currentItem.word.length - inputText.length;
      setScore(prev => prev + currentItem.price);
      setCorrectKeys(prev => prev + Math.max(remainingKeys, 0));
      setPlateCounts(prev => ({ ...prev, [currentItem.price]: prev[currentItem.price] + 1 }));

      setCombo(prev => {
        const newCombo = prev + 1;
        if (newCombo % COMBO_REQUIREMENT === 0) {
          const bonusLevel = Math.floor(newCombo / COMBO_REQUIREMENT);
          const bonusSeconds = bonusLevel <= 2 ? 1 : bonusLevel === 3 ? 2 : 3;
          setTimeLeft(t => t + bonusSeconds);
          setTotalGameTime(t => t + bonusSeconds);
          setComboSeconds(bonusSeconds);
          setShowComboBonus(true);
          setTimeout(() => setShowComboBonus(false), 1000);
        }
        return newCombo;
      });

      // Force remount input to fully reset Korean IME state
      setInputKey(prev => prev + 1);
      spawnNextItem();
      return;
    }

    // Partial match
    if (currentItem.word.startsWith(value)) {
      if (value.length > inputText.length) {
        setCorrectKeys(prev => prev + (value.length - inputText.length));
      }
      setInputText(value);
    } else {
      if (value.length > inputText.length) {
        setMistypes(prev => prev + 1);
      }
      setInputText(value);
    }
  };

  const diff = currentCourse ? score - currentCourse.cost : 0;
  // Use totalGameTime for avg calculation (includes bonus seconds, minus remaining time)
  const actualPlayTime = totalGameTime - timeLeft;
  const avgKeysPerSec = actualPlayTime > 0 ? (correctKeys / actualPlayTime).toFixed(1) : '0.0';
  const comboProgress = (combo % 20) / 20 * 100;

  // ============================
  // TITLE SCREEN
  // ============================
  if (gameState === 'TITLE') {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-black">
        <div className="game-container wood-bg flex flex-col items-center justify-center gap-6 cursor-pointer"
          onClick={() => setGameState('COURSE_SELECT')}>
          {/* Title Content */}
          <div className="text-center" style={{ animation: 'fadeInUp 0.8s ease-out' }}>
            <div className="text-6xl mb-4">🍣</div>
            <h1 className="text-4xl font-black text-[#333] title-text-shadow mb-2">스시다</h1>
            <p className="text-sm font-bold text-[#666] mb-1">한국어 타이핑 게임</p>
            <div className="flex items-center justify-center gap-2 mt-4 text-3xl">
              <span>🍤</span><span>🍙</span><span>🍱</span><span>🐟</span><span>🦐</span>
            </div>
          </div>

          <div className="mt-8" style={{ animation: 'pulse 2s ease-in-out infinite' }}>
            <p className="text-lg font-bold text-[#8b5a2b]">클릭하여 시작</p>
          </div>

          <div className="absolute bottom-4 text-xs text-[#999] font-bold">v0.1.0</div>
        </div>
      </div>
    );
  }

  // ============================
  // COURSE SELECT SCREEN
  // ============================
  if (gameState === 'COURSE_SELECT') {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-black">
        <div className="game-container wood-bg flex flex-col items-center pt-6 relative">
          <h1 className="text-sm font-bold text-[#333] mb-4 tracking-widest px-4 text-center">
            난이도를 결정한 후, 코스를 선택해 주세요.
          </h1>

          {/* Difficulty tabs */}
          <div className="difficulty-tabs w-full max-w-[520px] bg-[#fdf5e6] rounded-full py-2 px-6 flex justify-between items-center border-[3px] border-[#8b5a2b] mb-4 text-sm mx-4"
            style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            {DIFFICULTIES.map(diff => (
              <span
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`difficulty-tab ${selectedDifficulty === diff ? 'active' : ''}`}
              >
                {diff}
              </span>
            ))}
          </div>

          {/* Course buttons */}
          <div className="course-list w-full max-w-[520px] space-y-3 flex-1 overflow-auto px-2">
            {Object.values(COURSES).map((course) => (
              <div
                key={course.id}
                onClick={() => startGame(course.id)}
                className="course-btn w-full flex items-center p-3"
              >
                <div className="course-emoji w-16 h-14 flex justify-center items-center text-5xl mr-2 flex-shrink-0">
                  {course.emoji}
                </div>
                <div className="flex-1 border-r border-gray-400 pr-3 min-w-0">
                  <h2 className="course-title text-xl font-black tracking-tighter" style={{ color: course.color }}>
                    {course.title}
                  </h2>
                  <p className="course-cost text-xl font-black text-gray-900">
                    {course.cost.toLocaleString()}원 코스
                  </p>
                </div>
                <div className="w-[180px] pl-4 text-sm font-bold text-gray-800 leading-relaxed flex-shrink-0">
                  <p className="course-desc">글자 수 : {course.descLength}</p>
                  <p className="course-desc">제한시간 : {course.timeLimit}초</p>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="w-full flex justify-end p-2 border-t-2 border-[#d6a55c] wood-bar mt-auto">
            <button
              onClick={() => setGameState('TITLE')}
              className="sushi-btn py-1 px-4 text-sm"
            >
              타이틀로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================
  // PLAYING SCREEN
  // ============================
  if (gameState === 'PLAYING') {
    return (
      <div
        className="min-h-dvh flex items-center justify-center bg-black"
        onClick={() => inputRef.current?.focus()}
      >
        <div className="game-container flex flex-col relative" style={{ backgroundColor: '#b2c077' }}>
          {/* Hidden input - key changes on word completion to reset Korean IME */}
          <input
            key={`input-${inputKey}`}
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={handleInput}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            className="hidden-input"
            autoFocus
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
          />

          {/* Top bar: Timer & Combo meter */}
          <div className="top-bar wood-bar w-full h-[56px] flex items-center justify-between px-4 z-20 flex-shrink-0">
            <div className="flex items-baseline gap-1 text-[#333]">
              <span className="top-bar-text font-bold text-base tracking-widest">남은 시간</span>
              <span className="top-bar-time text-3xl font-black" style={{ fontFamily: 'serif' }}>
                {String(timeLeft).padStart(3, '0')}
              </span>
              <span className="top-bar-text font-bold text-base">초</span>
            </div>

            <div className="combo-meter w-[240px] flex flex-col pt-1">
              <span className="combo-label text-[10px] font-bold text-[#333] mb-1 text-center">연타 미터</span>
              <div className="relative w-full h-[2px] bg-black">
                <div
                  className="absolute top-0 left-0 h-full bg-red-600 transition-all duration-300"
                  style={{ width: `${Math.min(comboProgress, 100)}%` }}
                />
                {[1, 2, 3, 4].map(i => (
                  <div
                    key={i}
                    className="absolute top-[2px] text-[8px] font-bold text-red-600 -translate-x-1/2"
                    style={{ left: `${i * 25}%` }}
                  >
                    <span className="inline-block -mt-1">↑</span>
                    {i <= 2 ? '1초추가' : i === 3 ? '2초추가' : '3초추가'}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Combo bonus popup */}
          {showComboBonus && (
            <div
              className="absolute top-[56px] left-1/2 -translate-x-1/2 z-30 bg-yellow-400 text-black font-black text-lg px-6 py-2 rounded-full shadow-lg"
              style={{ animation: 'fadeInUp 0.3s ease-out' }}
            >
              +{comboSeconds}초 추가! 🎉
            </div>
          )}

          {/* Game area */}
          <div className="game-area flex-1 relative overflow-hidden">
            {/* Conveyor belt */}
            <div className="absolute top-[40%] w-full h-[90px] belt-bg border-y-2 border-[#d49b54] z-0">
              <div className="w-full h-full belt-curves opacity-50" />
              <div className="absolute bottom-0 w-full h-2 bg-black/10" />
            </div>

            {/* Counter bottom */}
            <div className="absolute bottom-0 w-full h-[35%] bg-[#d49b54] border-t-[3px] border-[#c08843] z-0" />

            {/* Soy sauce dish */}
            <div className="absolute bottom-6 left-8 z-10">
              <div className="w-[60px] h-[20px] bg-white rounded-[50%] shadow-md flex items-center justify-center border border-gray-100">
                <div className="w-[42px] h-[12px] bg-[#3a0b0b] rounded-[50%]" />
              </div>
            </div>

            {/* Green tea cup */}
            <div className="absolute bottom-3 right-10 z-10">
              <div className="w-[65px] h-[75px] bg-gradient-to-r from-[#d9d9f0] via-white to-[#c0c0d8] rounded-b-[8px] shadow-lg relative">
                <div className="absolute -top-[8px] left-0 w-full h-[16px] bg-white rounded-[50%] border border-gray-300 flex items-center justify-center overflow-hidden">
                  <div className="w-[90%] h-[80%] bg-[#96a56c] rounded-[50%]" />
                </div>
              </div>
            </div>

            {/* Sushi item & word */}
            {currentItem && (
              <div
                key={currentItem.id}
                className="slideLeftAnim absolute z-20 flex flex-col items-center"
                style={{
                  top: 'calc(40% - 20px)',
                  left: 0,
                  animationName: 'slideLeftDesktop',
                  animationDuration: `${currentItem.speed}s`,
                  animationTimingFunction: 'linear',
                  animationFillMode: 'forwards',
                }}
                onAnimationEnd={() => { setCombo(0); spawnNextItem(); }}
              >
                {/* Sushi plate */}
                <div className="plate-container relative flex justify-center items-center w-[140px] h-[50px]">
                  <div
                    className="plate-outer absolute w-[120px] h-[42px] bg-white rounded-[50%] shadow-md flex items-center justify-center"
                    style={{ border: '3px solid #f0f0f0' }}
                  >
                    <div
                      className="plate-inner w-[90px] h-[30px] rounded-[50%]"
                      style={{ border: `4px solid ${currentItem.plateColor}` }}
                    />
                  </div>
                  <div className="sushi-emoji text-5xl absolute -top-7 drop-shadow-lg">
                    {currentItem.emoji}
                  </div>
                </div>

                {/* Word card */}
                <div className="word-card mt-[-8px] py-3 px-8 text-center">
                  <div className="word-text text-white text-xl font-bold tracking-widest mb-1">
                    {currentItem.word.split('').map((char, i) => (
                      <span
                        key={i}
                        style={{
                          color: i < inputText.length
                            ? (currentItem.word.startsWith(inputText) ? '#4caf50' : '#f44336')
                            : 'white'
                        }}
                      >
                        {char}
                      </span>
                    ))}
                  </div>
                  <div className="text-gray-400 text-sm font-mono">
                    {inputText || '\u00A0'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom score bar */}
          <div className="score-bar w-full h-[36px] flex items-center px-3 z-20 gap-2 text-[#333] text-xs font-bold flex-shrink-0">
            <span className="score-bar-item">스코어</span>
            {Object.keys(PLATE_TYPES).map(priceStr => {
              const price = Number(priceStr);
              return (
                <div key={price} className="score-bar-item flex items-center gap-[2px]">
                  <div className="w-[16px] h-[16px] bg-white rounded-full flex items-center justify-center border border-gray-400">
                    <div
                      className="plate-ring"
                      style={{ borderColor: PLATE_TYPES[price].color, width: 10, height: 10 }}
                    />
                  </div>
                  <span className="font-mono score-bar-price">
                    ₩{(price / 10).toFixed(0)}×{String(plateCounts[price]).padStart(2, '0')}
                  </span>
                </div>
              );
            })}

            <div className="ml-auto flex gap-1">
              <button className="sushi-btn px-2 py-[1px] text-[10px]" onClick={() => setGameState('COURSE_SELECT')}>
                중단
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================
  // END / RESULT SCREEN
  // ============================
  if (gameState === 'END' && currentCourse) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-black">
        <div className="game-container wood-bg flex flex-col items-center justify-center relative overflow-y-auto">

          {/* Result card */}
          <div className="result-card w-[580px] bg-white shadow-xl relative z-10 mb-2" style={{ animation: 'fadeInUp 0.5s ease-out' }}>
            {/* Header */}
            <div className="result-header bg-[#2a2a2a] text-white py-3 px-6 flex items-center justify-center gap-3 text-lg">
              <span className="font-black" style={{ color: currentCourse.color }}>{currentCourse.title}</span>
              <span className="font-bold tracking-wider">{currentCourse.cost.toLocaleString()}원 코스</span>
              <span className="text-yellow-400 font-bold ml-2">【{selectedDifficulty}】</span>
            </div>

            <div className="result-body p-6 relative">
              {/* Stamp */}
              <div className="stamp absolute top-3 left-4 border-[3px] border-[#cc0000] text-[#cc0000] font-black text-2xl rounded p-1 px-2 select-none"
                style={{ transform: 'rotate(-15deg)' }}>
                성적
              </div>

              {/* Score info */}
              <div className="flex flex-col items-center mt-4 mb-4 text-gray-800 font-bold">
                <p className="result-score-text text-lg flex items-baseline gap-1">
                  <span className="result-score-num text-2xl font-black">{score.toLocaleString()}</span>
                  원어치의 초밥을 획득!
                </p>
                <p className="text-base text-gray-500 mt-1 flex items-baseline gap-1">
                  <span className="text-xl">{currentCourse.cost.toLocaleString()}</span> 원 지불해서...
                </p>
              </div>

              {/* Profit/Loss box */}
              <div className="w-4/5 mx-auto border-[3px] border-gray-400 rounded-full py-2 text-center mb-6">
                <p className={`result-diff-text text-xl font-bold tracking-tight ${diff >= 0 ? 'text-gray-800' : 'text-gray-500'}`}>
                  <span className="result-diff-num text-2xl font-black">{Math.abs(diff).toLocaleString()}</span>
                  {diff >= 0 ? ' 원 이득이었습니다!' : ' 원 손해였습니다...'}
                </p>
              </div>

              {/* Stats row */}
              <div className="flex justify-between items-center text-center">
                <div className="flex-1 border-r border-dashed border-gray-400">
                  <p className="result-stat-label text-[#cc0000] font-bold text-[11px] mb-1">정확하게 친 키의 수</p>
                  <p className="result-stat-value text-xl font-black text-gray-800">
                    {correctKeys} <span className="text-sm font-bold text-gray-500">회</span>
                  </p>
                </div>
                <div className="flex-1 border-r border-dashed border-gray-400">
                  <p className="result-stat-label text-[#cc0000] font-bold text-[11px] mb-1">평균 키 타입 수</p>
                  <p className="result-stat-value text-xl font-black text-gray-800">
                    {avgKeysPerSec} <span className="text-sm font-bold text-gray-500">회/초</span>
                  </p>
                </div>
                <div className="flex-1">
                  <p className="result-stat-label text-[#cc0000] font-bold text-[11px] mb-1">미스타입 수</p>
                  <p className="result-stat-value text-xl font-black text-gray-800">
                    {mistypes} <span className="text-sm font-bold text-gray-500">회</span>
                  </p>
                </div>
              </div>

              {/* Bottom banner */}
              <div className="flex justify-between items-end mt-4">
                <div className="bg-[#e6e6e6] text-[#666] text-[10px] p-2 rounded leading-tight">
                  <p>ℹ️ 금액이 플러스(이득)가 되면</p>
                  <p>랭킹에 참가할 수 있습니다</p>
                </div>
                <button className="bg-black text-white font-bold py-2 px-4 rounded-md text-sm tracking-widest hover:bg-gray-800 transition-colors">
                  결과를 𝕏에서 포스트
                </button>
              </div>
            </div>

            <div className="paper-fold" />
          </div>

          {/* Navigation buttons */}
          <div className="nav-buttons flex gap-2 mt-2 z-10 w-[580px] justify-between px-2">
            <div className="flex-1 text-center">
              <button
                onClick={() => startGame(currentCourse.id)}
                className="sushi-btn w-full py-1 text-base"
              >
                한 번 더
              </button>
              <p className="text-[#333] text-[10px] font-bold mt-1">(Esc 키)</p>
            </div>
            <div className="flex-1 text-center">
              <button
                onClick={() => setGameState('COURSE_SELECT')}
                className="sushi-btn w-full py-1 text-base"
              >
                코스 선택
              </button>
            </div>
            <div className="flex-1 text-center">
              <button
                onClick={() => setGameState('TITLE')}
                className="sushi-btn w-full py-1 text-base"
              >
                타이틀로 돌아가기
              </button>
            </div>
          </div>

          {/* Score bar at bottom */}
          <div className="absolute bottom-0 left-0 score-bar w-full h-[32px] flex items-center px-3 z-20 gap-2 text-[#333] text-[10px] font-bold">
            <span>스코어</span>
            {Object.keys(PLATE_TYPES).map(priceStr => {
              const price = Number(priceStr);
              return (
                <div key={price} className="flex items-center gap-[2px]">
                  <div className="w-[14px] h-[14px] bg-white rounded-full flex items-center justify-center border border-gray-300">
                    <div
                      className="plate-ring"
                      style={{ borderColor: PLATE_TYPES[price].color, width: 8, height: 8 }}
                    />
                  </div>
                  <span className="font-mono">
                    ₩{(price / 10).toFixed(0)}×{String(plateCounts[price]).padStart(2, '0')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
