import { Chess } from 'chess.js';

const isValidDate = (dateString) => {
  const regEx = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateString.match(regEx)) return false;
  const d = new Date(dateString);
  const dNum = d.getTime();
  if (!dNum && dNum !== 0) return false;
  return d.toISOString().slice(0, 10) === dateString;
};

const isValidGame = (gameString) => {
  const chess = new Chess();
  chess.loadPgn(gameString);
  return chess.history().length;
};

const isValidUrl = (urlString) => {
  let url;
  try {
    url = new URL(urlString);
  } catch (_) {
    return false;
  }
  return url.protocol === 'http:' || url.protocol === 'https:';
};

const getPositions = (pgn) => {
  const chess = new Chess();
  chess.loadPgn(pgn);

  const fens = [];
  const moves = [];

  const history = chess.history({ verbose: true });
  for (const move of history) {
    fens.push(move.before);
    moves.push(move.san);
  }
  fens.push(chess.fen());
  return { fens, moves, numMoves: fens.length - 1 };
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export {
  getPositions,
  isValidDate,
  isValidGame,
  isValidUrl,
  wait,
};
