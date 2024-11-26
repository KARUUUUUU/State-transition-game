import React, { useState, useRef, useEffect } from 'react';

const CanvasComponent = ({ states, onAddState, onDeleteState }) => {
  const canvasRef = useRef(null);
  const [stateCounter, setStateCounter] = useState(states.length);  // Initialize based on current number of states
  const [selectedState, setSelectedState] = useState(null);
  const [connections, setConnections] = useState([]);
  const [draggingState, setDraggingState] = useState(null);
  const [connectingState, setConnectingState] = useState(null);
  const [currentMousePos, setCurrentMousePos] = useState(null);
  const [mode, setMode] = useState('move');

  const addState = () => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = rect.width / 2;
    const y = rect.height / 2;
  
    // If states array is empty, reset the stateCounter to 0
    const newStateName = states.length === 0 ? 'q0' : `q${stateCounter}`;
  
    const newState = {
      x,
      y,
      radius: 30,
      name: newStateName,
      isInitial: false,
      isFinal: false,
    };
  
    // Add the new state
    onAddState(newState);
  
    // Update the stateCounter based on the current states
    setStateCounter(states.length === 0 ? 1 : stateCounter + 1); // Reset counter to 1 if it's the first state
    renderCanvas();
  };
  
  

  const deleteState = () => {
    if (selectedState) {
      onDeleteState(selectedState);
  
      // Remove the selected state from the states list
      const updatedStates = states.filter((state) => state !== selectedState);
  
      // If all states are removed, reset the stateCounter to 0
      if (updatedStates.length === 0) {
        setStateCounter(0); // Reset the counter if no states remain
      } else {
        // Renumber states sequentially after deletion
        updatedStates.forEach((state, index) => {
          state.name = `q${index}`; // Renumber states sequentially
        });
        setStateCounter(updatedStates.length); // Set the counter based on remaining states
      }
  
      // Remove connections that involve the deleted state
      const updatedConnections = connections.filter(
        (conn) => conn.start !== selectedState && conn.end !== selectedState
      );
  
      // Update states, connections, and reset selected state
      setConnections(updatedConnections);
      setSelectedState(null);
      onAddState(updatedStates); // Update parent component's state
      renderCanvas();
    }
  };
  

  const renderCanvas = () => {
    const context = canvasRef.current.getContext('2d');
    if (context) {
      context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      // Draw connections
      connections.forEach(({ start, end, label }) => {
        drawArrow(context, start.x, start.y, end.x, end.y);
        if (label) drawLabel(context, label, start.x, start.y, end.x, end.y);
      });

      // Draw current connection
      if (connectingState && currentMousePos) {
        drawArrow(
          context,
          connectingState.x,
          connectingState.y,
          currentMousePos.x,
          currentMousePos.y,
          'blue'
        );
      }

      // Draw states
      states.forEach((state) => {
        drawState(context, state);
      });
    }
  };

  const drawArrow = (context, x1, y1, x2, y2, color = 'gray') => {
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.strokeStyle = color;
    context.lineWidth = 2;
    context.stroke();

    drawArrowhead(context, x1, y1, x2, y2, color);
  };

  const drawArrowhead = (context, x1, y1, x2, y2, color = 'gray') => {
    const headLength = 10;
    const angle = Math.atan2(y2 - y1, x2 - x1);
    context.beginPath();
    context.moveTo(x2, y2);
    context.lineTo(
      x2 - headLength * Math.cos(angle - Math.PI / 6),
      y2 - headLength * Math.sin(angle - Math.PI / 6)
    );
    context.lineTo(
      x2 - headLength * Math.cos(angle + Math.PI / 6),
      y2 - headLength * Math.sin(angle + Math.PI / 6)
    );
    context.lineTo(x2, y2);
    context.fillStyle = color;
    context.fill();
  };

  const drawLabel = (context, label, x1, y1, x2, y2) => {
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;

    context.fillStyle = 'black';
    context.font = '14px Arial';
    context.textAlign = 'center';
    context.fillText(label, midX, midY);
  };

  const drawState = (context, state) => {
    context.beginPath();
    context.arc(state.x, state.y, state.radius, 0, 2 * Math.PI);
    context.fillStyle = 'white';
    context.strokeStyle =
      state === draggingState
        ? 'blue'
        : state === selectedState
        ? 'red'
        : 'black';
    context.lineWidth = 2;
    context.fill();
    context.stroke();

    if (state.isInitial) {
      context.beginPath();
      context.moveTo(state.x - 40, state.y);
      context.lineTo(state.x - 10, state.y);
      context.strokeStyle = 'green';
      context.lineWidth = 2;
      context.stroke();
      drawArrowhead(context, state.x - 40, state.y, state.x - 10, state.y, 'green');
    }

    if (state.isFinal) {
      context.beginPath();
      context.arc(state.x, state.y, state.radius - 5, 0, 2 * Math.PI);
      context.strokeStyle = 'blue';
      context.lineWidth = 2;
      context.stroke();
    }

    context.fillStyle = 'black';
    context.font = '16px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(state.name, state.x, state.y);
  };

  const toggleStateProperty = (property) => {
    if (selectedState) {
      selectedState[property] = !selectedState[property];
      renderCanvas();
    }
  };

  const clearConnections = () => {
    setConnections([]);
    renderCanvas();
  };

  useEffect(() => {
    renderCanvas();
  }, [states, connections, currentMousePos]);

  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    for (let i = states.length - 1; i >= 0; i--) {
      const state = states[i];
      if (Math.sqrt((x - state.x) ** 2 + (y - state.y) ** 2) <= state.radius) {
        if (mode === 'move') {
          setDraggingState(state);
        } else if (mode === 'draw') {
          setConnectingState(state);
        }
        setSelectedState(state);
        return;
      }
    }

    setDraggingState(null);
    setConnectingState(null);
    setSelectedState(null);
  };

  const handleMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (mode === 'move' && draggingState) {
      draggingState.x = x;
      draggingState.y = y;
      renderCanvas();
    } else if (mode === 'draw' && connectingState) {
      setCurrentMousePos({ x, y });
      renderCanvas();
    }
  };

  const handleMouseUp = (e) => {
    if (mode === 'draw' && connectingState) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      for (let i = states.length - 1; i >= 0; i--) {
        const state = states[i];
        if (Math.sqrt((x - state.x) ** 2 + (y - state.y) ** 2) <= state.radius) {
          if (state !== connectingState) {
            setConnections((prev) => [
              ...prev,
              { start: connectingState, end: state, label: 'a' },
            ]);
          }
          break;
        }
      }
    }

    setDraggingState(null);
    setConnectingState(null);
    setCurrentMousePos(null);
    renderCanvas();
  };

  const toggleMode = () => {
    setMode((prev) => (prev === 'move' ? 'draw' : 'move'));
  };

  return (
    <div className="canvas-container">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
      <div className="controls">
        <button onClick={addState}>Add State</button>
        <button onClick={deleteState}>Delete State</button>
        <button onClick={() => toggleStateProperty('isInitial')}>
          Toggle Initial State
        </button>
        <button onClick={() => toggleStateProperty('isFinal')}>
          Toggle Final State
        </button>
        <button onClick={clearConnections}>Clear Connections</button>
        <button onClick={toggleMode}>
          {mode === 'move' ? 'Draw Mode' : 'Move Mode'}
        </button>
      </div>
    </div>
  );
};

export default CanvasComponent;







