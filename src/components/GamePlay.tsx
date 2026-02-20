'use client';

import React from 'react';
import { type GameItem, type Course } from '@/lib/gameData';
import ConveyorBelt from './ConveyorBelt';
import ScoreBar from './ScoreBar';

interface GamePlayProps {
    timeLeft: number;
    combo: number;
    comboProgress: number;
    showComboBonus: boolean;
    comboSeconds: number;
    currentItem: GameItem | null;
    inputText: string;
    inputKey: number;
    plateCounts: Record<number, number>;
    inputRef: React.RefObject<HTMLInputElement | null>;
    onInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onCompositionStart: () => void;
    onCompositionEnd: (e: React.CompositionEvent<HTMLInputElement>) => void;
    onItemMissed: () => void;
    onStop: () => void;
    focusInput: () => void;
}

export default function GamePlay({
    timeLeft,
    combo,
    comboProgress,
    showComboBonus,
    comboSeconds,
    currentItem,
    inputText,
    inputKey,
    plateCounts,
    inputRef,
    onInput,
    onCompositionStart,
    onCompositionEnd,
    onItemMissed,
    onStop,
    focusInput,
}: GamePlayProps) {
    return (
        <div
            className="min-h-dvh flex items-center justify-center bg-black"
            onClick={focusInput}
        >
            <div className="game-container flex flex-col relative" style={{ backgroundColor: '#b2c077' }}>
                {/* Hidden input - key changes on word completion to reset Korean IME */}
                <input
                    key={`input-${inputKey}`}
                    ref={inputRef}
                    type="text"
                    value={inputText}
                    onChange={onInput}
                    onCompositionStart={onCompositionStart}
                    onCompositionEnd={onCompositionEnd}
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

                {/* Conveyor belt game area */}
                <ConveyorBelt
                    currentItem={currentItem}
                    inputText={inputText}
                    onAnimationEnd={onItemMissed}
                />

                {/* Bottom score bar */}
                <ScoreBar plateCounts={plateCounts}>
                    <button className="sushi-btn px-2 py-[1px] text-[10px]" onClick={onStop}>
                        중단
                    </button>
                </ScoreBar>
            </div>
        </div>
    );
}
