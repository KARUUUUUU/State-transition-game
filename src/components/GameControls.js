import React from 'react';

const GameControls = ({ onNextQuestion, onReset }) => {
  return (
    <div className="game-controls">
      <button onClick={onNextQuestion}>Next Question</button>
    </div>
  );
};

export default GameControls;

