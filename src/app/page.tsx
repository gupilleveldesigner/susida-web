'use client';

import { useGameState } from '@/hooks/useGameState';
import TitleScreen from '@/components/TitleScreen';
import CourseSelect from '@/components/CourseSelect';
import GamePlay from '@/components/GamePlay';
import GameResult from '@/components/GameResult';

export default function SusidaGame() {
  const game = useGameState();

  if (game.gameState === 'TITLE') {
    return (
      <TitleScreen onStart={() => game.actions.setGameState('COURSE_SELECT')} />
    );
  }

  if (game.gameState === 'COURSE_SELECT') {
    return (
      <CourseSelect
        selectedDifficulty={game.selectedDifficulty}
        onSelectDifficulty={game.actions.setSelectedDifficulty}
        onSelectCourse={game.actions.startGame}
        onBack={() => game.actions.setGameState('TITLE')}
      />
    );
  }

  if (game.gameState === 'PLAYING') {
    return (
      <GamePlay
        timeLeft={game.timeLeft}
        combo={game.combo}
        comboProgress={game.comboProgress}
        showComboBonus={game.showComboBonus}
        comboSeconds={game.comboSeconds}
        currentItem={game.currentItem}
        inputText={game.inputText}
        inputKey={game.inputKey}
        plateCounts={game.stats.plateCounts}
        inputRef={game.inputRef}
        onInput={game.actions.handleInput}
        onCompositionStart={game.actions.handleCompositionStart}
        onCompositionEnd={game.actions.handleCompositionEnd}
        onItemMissed={() => {
          game.actions.spawnNextItem();
        }}
        onStop={() => game.actions.setGameState('COURSE_SELECT')}
        focusInput={game.actions.focusInput}
      />
    );
  }

  if (game.gameState === 'END' && game.currentCourse) {
    return (
      <GameResult
        currentCourse={game.currentCourse}
        selectedDifficulty={game.selectedDifficulty}
        score={game.score}
        diff={game.diff}
        stats={game.stats}
        onRetry={() => game.actions.startGame(game.currentCourse!.id)}
        onCourseSelect={() => game.actions.setGameState('COURSE_SELECT')}
        onTitle={() => game.actions.setGameState('TITLE')}
      />
    );
  }

  return null;
}
