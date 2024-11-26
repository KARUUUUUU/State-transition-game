import React, { useState, useEffect } from 'react';
import Canvas from './components/CanvasComponent';
import GameControls from './components/GameControls';
import Header from './components/Header';

const App = () => {
  const [regexQuestion, setRegexQuestion] = useState('');
  const [states, setStates] = useState([]);
  const [transitions, setTransitions] = useState([]);
  const [initialState, setInitialState] = useState(null);
  const [finalState, setFinalState] = useState(null);
  const [questionCount, setQuestionCount] = useState(0);

  const regexQuestions = [
    'a*', 'ab+', '(a|b)*', 'ab*', 'a(b|c)+', 'a(b|c)*', 'a*b+', 'ab', 'a(a|b)+', 'a|b'
  ];

  // Generate a new random regex question
  const generateRandomQuestion = () => {
    const randomIndex = Math.floor(Math.random() * regexQuestions.length);
    setRegexQuestion(regexQuestions[randomIndex]);
    setStates([]); // Clear states and transitions for a new question
    setTransitions([]);
    setInitialState(null);
    setFinalState(null);
  };

  useEffect(() => {
    generateRandomQuestion();
  }, [questionCount]);

  const handleAddState = (state) => {
    setStates((prevStates) => [...prevStates, state]);
  };

  // Delete selected state
  const handleDeleteState = (stateToDelete) => {
    setStates((prevStates) => prevStates.filter(state => state !== stateToDelete));
  };

  const handleSetInitialState = (state) => {
    setInitialState(state);
  };

  const handleSetFinalState = (state) => {
    setFinalState(state);
  };

  const handleAddTransition = (transition) => {
    setTransitions((prevTransitions) => [...prevTransitions, transition]);
  };

  return (
    <div className="App">
      <Header />
      <div className="game-container">
        <h2>Regex: {regexQuestion}</h2>
        <Canvas
          states={states}
          onAddState={handleAddState}
          onDeleteState={handleDeleteState} // Pass delete function here
          transitions={transitions}
          initialState={initialState}
          finalState={finalState}
        />
        <GameControls
          states={states}
          onSetInitialState={handleSetInitialState}
          onSetFinalState={handleSetFinalState}
          onNextQuestion={() => setQuestionCount((prevCount) => prevCount + 1)}
        />
      </div>
    </div>
  );
};

export default App;
