'use client';

import React from 'react';
import { type GameItem } from '@/lib/gameData';

interface ConveyorBeltProps {
    currentItem: GameItem | null;
    inputText: string;
    onAnimationEnd: () => void;
}

export default function ConveyorBelt({ currentItem, inputText, onAnimationEnd }: ConveyorBeltProps) {
    return (
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
                    onAnimationEnd={onAnimationEnd}
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
                                            : 'white',
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
    );
}
