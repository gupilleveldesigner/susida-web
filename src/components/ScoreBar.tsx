'use client';

import React from 'react';
import { PLATE_TYPES } from '@/lib/gameData';

interface ScoreBarProps {
    plateCounts: Record<number, number>;
    compact?: boolean;
    children?: React.ReactNode;
}

export default function ScoreBar({ plateCounts, compact = false, children }: ScoreBarProps) {
    const height = compact ? 'h-[32px]' : 'h-[36px]';
    const textSize = compact ? 'text-[10px]' : 'text-xs';
    const dotSize = compact ? 14 : 16;
    const ringSize = compact ? 8 : 10;

    return (
        <div className={`score-bar w-full ${height} flex items-center px-3 z-20 gap-2 text-[#333] ${textSize} font-bold flex-shrink-0`}>
            <span>스코어</span>
            {Object.keys(PLATE_TYPES).map(priceStr => {
                const price = Number(priceStr);
                return (
                    <div key={price} className="flex items-center gap-[2px]">
                        <div
                            className="bg-white rounded-full flex items-center justify-center border border-gray-400"
                            style={{ width: dotSize, height: dotSize }}
                        >
                            <div
                                className="plate-ring"
                                style={{ borderColor: PLATE_TYPES[price].color, width: ringSize, height: ringSize }}
                            />
                        </div>
                        <span className="font-mono score-bar-price">
                            ₩{(price / 10).toFixed(0)}×{String(plateCounts[price]).padStart(2, '0')}
                        </span>
                    </div>
                );
            })}
            {children && <div className="ml-auto flex gap-1">{children}</div>}
        </div>
    );
}
