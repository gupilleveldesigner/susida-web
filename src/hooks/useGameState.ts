'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
    WORDS, PLATE_TYPES, COURSES, SUSHI_EMOJIS,
    COMBO_REQUIREMENT,
    type GameState, type GameItem, type Course,
} from '@/lib/gameData';

export interface GameStats {
    correctKeys: number;
    mistypes: number;
    avgKeysPerSec: string;
    plateCounts: Record<number, number>;
}

export interface GameActions {
    setGameState: (state: GameState) => void;
    setSelectedDifficulty: (diff: string) => void;
    startGame: (courseId: string) => void;
    handleInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleCompositionStart: () => void;
    handleCompositionEnd: (e: React.CompositionEvent<HTMLInputElement>) => void;
    spawnNextItem: () => void;
    focusInput: () => void;
}

export interface UseGameStateReturn {
    // State
    gameState: GameState;
    selectedDifficulty: string;
    currentCourse: Course | null;
    score: number;
    timeLeft: number;
    currentItem: GameItem | null;
    inputText: string;
    combo: number;
    showComboBonus: boolean;
    comboSeconds: number;
    inputKey: number;
    comboProgress: number;
    diff: number;

    // Stats
    stats: GameStats;

    // Actions
    actions: GameActions;

    // Refs
    inputRef: React.RefObject<HTMLInputElement | null>;
}

export function useGameState(): UseGameStateReturn {
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
        1000: 0, 1800: 0, 2400: 0, 3800: 0, 5000: 0,
    });

    const [combo, setCombo] = useState(0);
    const [showComboBonus, setShowComboBonus] = useState(false);
    const [comboSeconds, setComboSeconds] = useState(0);
    const [inputKey, setInputKey] = useState(0);

    const inputRef = useRef<HTMLInputElement>(null);
    const itemIdCounter = useRef(0);
    const isComposing = useRef(false);

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

    // Auto-spawn first item
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
        handleInputValue((e.target as HTMLInputElement).value);
    };

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
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
            setPlateCounts(prev => ({
                ...prev,
                [currentItem.price]: prev[currentItem.price] + 1,
            }));

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

    // Computed values
    const diff = currentCourse ? score - currentCourse.cost : 0;
    const actualPlayTime = totalGameTime - timeLeft;
    const avgKeysPerSec = actualPlayTime > 0
        ? (correctKeys / actualPlayTime).toFixed(1)
        : '0.0';
    const comboProgress = (combo % 20) / 20 * 100;

    const focusInput = () => inputRef.current?.focus();

    return {
        gameState,
        selectedDifficulty,
        currentCourse,
        score,
        timeLeft,
        currentItem,
        inputText,
        combo,
        showComboBonus,
        comboSeconds,
        inputKey,
        comboProgress,
        diff,
        stats: {
            correctKeys,
            mistypes,
            avgKeysPerSec,
            plateCounts,
        },
        actions: {
            setGameState,
            setSelectedDifficulty,
            startGame,
            handleInput,
            handleCompositionStart,
            handleCompositionEnd,
            spawnNextItem,
            focusInput,
        },
        inputRef,
    };
}
