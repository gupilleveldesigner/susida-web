'use client';

import React from 'react';
import { type Course } from '@/lib/gameData';
import ScoreBar from './ScoreBar';
import { type GameStats } from '@/hooks/useGameState';

interface GameResultProps {
    currentCourse: Course;
    selectedDifficulty: string;
    score: number;
    diff: number;
    stats: GameStats;
    onRetry: () => void;
    onCourseSelect: () => void;
    onTitle: () => void;
}

export default function GameResult({
    currentCourse,
    selectedDifficulty,
    score,
    diff,
    stats,
    onRetry,
    onCourseSelect,
    onTitle,
}: GameResultProps) {
    return (
        <div className="min-h-dvh flex items-center justify-center bg-black">
            <div className="game-container wood-bg flex flex-col items-center justify-center relative overflow-y-auto">
                {/* Result card */}
                <div
                    className="result-card w-[580px] bg-white shadow-xl relative z-10 mb-2"
                    style={{ animation: 'fadeInUp 0.5s ease-out' }}
                >
                    {/* Header */}
                    <div className="result-header bg-[#2a2a2a] text-white py-3 px-6 flex items-center justify-center gap-3 text-lg">
                        <span className="font-black" style={{ color: currentCourse.color }}>
                            {currentCourse.title}
                        </span>
                        <span className="font-bold tracking-wider">
                            {currentCourse.cost.toLocaleString()}원 코스
                        </span>
                        <span className="text-yellow-400 font-bold ml-2">【{selectedDifficulty}】</span>
                    </div>

                    <div className="result-body p-6 relative">
                        {/* Stamp */}
                        <div
                            className="stamp absolute top-3 left-4 border-[3px] border-[#cc0000] text-[#cc0000] font-black text-2xl rounded p-1 px-2 select-none"
                            style={{ transform: 'rotate(-15deg)' }}
                        >
                            성적
                        </div>

                        {/* Score info */}
                        <div className="flex flex-col items-center mt-4 mb-4 text-gray-800 font-bold">
                            <p className="result-score-text text-lg flex items-baseline gap-1">
                                <span className="result-score-num text-2xl font-black">
                                    {score.toLocaleString()}
                                </span>
                                원어치의 초밥을 획득!
                            </p>
                            <p className="text-base text-gray-500 mt-1 flex items-baseline gap-1">
                                <span className="text-xl">{currentCourse.cost.toLocaleString()}</span> 원
                                지불해서...
                            </p>
                        </div>

                        {/* Profit/Loss box */}
                        <div className="w-4/5 mx-auto border-[3px] border-gray-400 rounded-full py-2 text-center mb-6">
                            <p
                                className={`result-diff-text text-xl font-bold tracking-tight ${diff >= 0 ? 'text-gray-800' : 'text-gray-500'
                                    }`}
                            >
                                <span className="result-diff-num text-2xl font-black">
                                    {Math.abs(diff).toLocaleString()}
                                </span>
                                {diff >= 0 ? ' 원 이득이었습니다!' : ' 원 손해였습니다...'}
                            </p>
                        </div>

                        {/* Stats row */}
                        <div className="flex justify-between items-center text-center">
                            <div className="flex-1 border-r border-dashed border-gray-400">
                                <p className="result-stat-label text-[#cc0000] font-bold text-[11px] mb-1">
                                    정확하게 친 키의 수
                                </p>
                                <p className="result-stat-value text-xl font-black text-gray-800">
                                    {stats.correctKeys}{' '}
                                    <span className="text-sm font-bold text-gray-500">회</span>
                                </p>
                            </div>
                            <div className="flex-1 border-r border-dashed border-gray-400">
                                <p className="result-stat-label text-[#cc0000] font-bold text-[11px] mb-1">
                                    평균 키 타입 수
                                </p>
                                <p className="result-stat-value text-xl font-black text-gray-800">
                                    {stats.avgKeysPerSec}{' '}
                                    <span className="text-sm font-bold text-gray-500">회/초</span>
                                </p>
                            </div>
                            <div className="flex-1">
                                <p className="result-stat-label text-[#cc0000] font-bold text-[11px] mb-1">
                                    미스타입 수
                                </p>
                                <p className="result-stat-value text-xl font-black text-gray-800">
                                    {stats.mistypes}{' '}
                                    <span className="text-sm font-bold text-gray-500">회</span>
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
                        <button onClick={onRetry} className="sushi-btn w-full py-1 text-base">
                            한 번 더
                        </button>
                        <p className="text-[#333] text-[10px] font-bold mt-1">(Esc 키)</p>
                    </div>
                    <div className="flex-1 text-center">
                        <button onClick={onCourseSelect} className="sushi-btn w-full py-1 text-base">
                            코스 선택
                        </button>
                    </div>
                    <div className="flex-1 text-center">
                        <button onClick={onTitle} className="sushi-btn w-full py-1 text-base">
                            타이틀로 돌아가기
                        </button>
                    </div>
                </div>

                {/* Score bar at bottom */}
                <div className="absolute bottom-0 left-0 w-full">
                    <ScoreBar plateCounts={stats.plateCounts} compact />
                </div>
            </div>
        </div>
    );
}
