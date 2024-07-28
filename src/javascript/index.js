import '../sass/styles.scss';

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './views/App.jsx';

const stockfish = new Worker('/dist/stockfish.js');

window.stockfish = stockfish;

// stockfish.postMessage(`position fen ${fen}`)
// stockfish.postMessage('setoption name MultiPV value 4')
// stockfish.postMessage('go ponder')
// stockfish.postMessage('go depth 10');
// go infinite searchmoves e2e4 d2d4
// it will say stuff like score cp 108 << centipawn
// setoption name Skill Level value 20

// chess.move({ from: 'g2', to: 'g3' })
// -> { color: 'w', from: 'g2', to: 'g3', flags: 'n', piece: 'p', san: 'g3' }

stockfish.onmessage = (event) => {
  console.log(event.data);
};

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);
root.render(<App />);
