'use client';

import React from 'react';

interface TitleScreenProps {
    onStart: () => void;
}

export default function TitleScreen({ onStart }: TitleScreenProps) {
    return (
        <div className="min-h-dvh flex items-center justify-center bg-black">
            <div
                className="game-container wood-bg flex flex-col items-center justify-center gap-6 cursor-pointer"
                onClick={onStart}
            >
                <div className="text-center" style={{ animation: 'fadeInUp 0.8s ease-out' }}>
                    <div className="text-6xl mb-4">🍣</div>
                    <h1 className="text-4xl font-black text-[#333] title-text-shadow mb-2">
                        스시다
                    </h1>
                    <p className="text-sm font-bold text-[#666] mb-1">한국어 타이핑 게임</p>
                    <div className="flex items-center justify-center gap-2 mt-4 text-3xl">
                        <span>🍤</span><span>🍙</span><span>🍱</span><span>🐟</span><span>🦐</span>
                    </div>
                </div>

                <div className="mt-8" style={{ animation: 'pulse 2s ease-in-out infinite' }}>
                    <p className="text-lg font-bold text-[#8b5a2b]">클릭하여 시작</p>
                </div>

                <div className="absolute bottom-4 text-xs text-[#999] font-bold">v0.2.0</div>
            </div>
        </div>
    );
}
