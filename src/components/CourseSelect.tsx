'use client';

import React from 'react';
import { COURSES, DIFFICULTIES, type Course } from '@/lib/gameData';

interface CourseSelectProps {
    selectedDifficulty: string;
    onSelectDifficulty: (diff: string) => void;
    onSelectCourse: (courseId: string) => void;
    onBack: () => void;
}

export default function CourseSelect({
    selectedDifficulty,
    onSelectDifficulty,
    onSelectCourse,
    onBack,
}: CourseSelectProps) {
    return (
        <div className="min-h-dvh flex items-center justify-center bg-black">
            <div className="game-container wood-bg flex flex-col items-center pt-6 relative">
                <h1 className="text-sm font-bold text-[#333] mb-4 tracking-widest px-4 text-center">
                    난이도를 결정한 후, 코스를 선택해 주세요.
                </h1>

                {/* Difficulty tabs */}
                <div
                    className="difficulty-tabs w-full max-w-[520px] bg-[#fdf5e6] rounded-full py-2 px-6 flex justify-between items-center border-[3px] border-[#8b5a2b] mb-4 text-sm mx-4"
                    style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                >
                    {DIFFICULTIES.map(diff => (
                        <span
                            key={diff}
                            onClick={() => onSelectDifficulty(diff)}
                            className={`difficulty-tab ${selectedDifficulty === diff ? 'active' : ''}`}
                        >
                            {diff}
                        </span>
                    ))}
                </div>

                {/* Course buttons */}
                <div className="course-list w-full max-w-[520px] space-y-3 flex-1 overflow-auto px-2">
                    {Object.values(COURSES).map((course: Course) => (
                        <div
                            key={course.id}
                            onClick={() => onSelectCourse(course.id)}
                            className="course-btn w-full flex items-center p-3"
                        >
                            <div className="course-emoji w-16 h-14 flex justify-center items-center text-5xl mr-2 flex-shrink-0">
                                {course.emoji}
                            </div>
                            <div className="flex-1 border-r border-gray-400 pr-3 min-w-0">
                                <h2
                                    className="course-title text-xl font-black tracking-tighter"
                                    style={{ color: course.color }}
                                >
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
                    <button onClick={onBack} className="sushi-btn py-1 px-4 text-sm">
                        타이틀로 돌아가기
                    </button>
                </div>
            </div>
        </div>
    );
}
