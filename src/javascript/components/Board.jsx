import React, { useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import {
  IconButton, Box,
} from '@mui/material';
import {
  KeyboardDoubleArrowLeft,
  KeyboardDoubleArrowRight,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  Flip,
} from '@mui/icons-material';
import MoveTracker from './MoveTracker.jsx';
import StockfishAnalysis from './StockfishAnalysis.jsx';

const convertFENsToMoves = (fenArray) => {
  const chess = new Chess();
  const movesArray = [];

  for (let i = 0; i < fenArray.length - 1; i += 1) {
    const initialFEN = fenArray[i];
    const finalFEN = fenArray[i + 1];

    chess.load(initialFEN);

    const possibleMoves = chess.moves({ verbose: true });

    let foundMove = false;
    for (const move of possibleMoves) {
      chess.move(move);
      if (chess.fen() === finalFEN) {
        foundMove = true;
        movesArray.push(move.san);
        break;
      }
      chess.undo();
    }

    if (!foundMove) {
      movesArray.push(null);
    }
  }

  let pgn = '';

  for (let i = 0; i < movesArray.length; i += 1) {
    if (i % 2 === 0) {
      pgn += `${i / 2 + 1}. `;
    }
    pgn += `${movesArray[i]} `;
  }

  return pgn.trim();
};

const Board = ({
  pgnMoves,
  setPgnMoves,
  edit,
  showMoveTracker,
  showStockfish,
}) => {
  const [fenPositions, setFenPositions] = useState([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [flipBoard, setFlipBoard] = useState(false);

  const chess = new Chess();

  useEffect(() => {
    chess.reset();
    const moves = pgnMoves.split(/\d+\./).filter((move) => move.trim().length > 0);
    const fens = ['rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'];
    for (let i = 0; i < moves.length; i += 1) {
      const moveList = moves[i].trim().split(/\s+/);
      for (let j = 0; j < moveList.length; j += 1) {
        const move = moveList[j];
        try {
          const result = chess.move(move, { sloppy: true });
          if (result !== null) {
            fens.push(chess.fen());
          } else {
            break;
          }
        } catch (error) {
          return;
        }
      }
    }
    setFenPositions(fens);
  }, [pgnMoves]);

  useEffect(() => {
    if (setPgnMoves) {
      setPgnMoves(convertFENsToMoves(fenPositions));
      setCurrentMoveIndex(fenPositions.length - 1);
    }
  }, [fenPositions]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.keyCode === 37) {
        // Left arrow key
        if (currentMoveIndex > 0) {
          setCurrentMoveIndex((prev) => prev - 1);
        }
      } else if (event.keyCode === 39) {
        // Right arrow key
        if (currentMoveIndex < fenPositions.length - 1) {
          setCurrentMoveIndex((prev) => prev + 1);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentMoveIndex, fenPositions, edit]);

  const handleSkipToStart = () => {
    setCurrentMoveIndex(0);
  };

  const handleSkipToEnd = () => {
    setCurrentMoveIndex(fenPositions.length - 1);
  };

  const handleFlipBoard = () => {
    setFlipBoard((prev) => !prev);
  };

  const handleMoveClick = (moveIndex) => {
    setCurrentMoveIndex(moveIndex);
  };

  const handleMovePiece = (from, to, piece) => {
    if (edit) {
      const startingFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
      const newFens = fenPositions.slice(0, currentMoveIndex + 1);
      const position = currentMoveIndex === 0 ? startingFen : fenPositions[currentMoveIndex];

      try {
        chess.load(position);
      } catch (error) {
        return false;
      }

      let move;

      try {
        move = chess.move({ from, to, promotion: piece[1].toLowerCase() ?? 'q' });
      } catch (error) {
        return false;
      }

      if (move !== null) {
        if (currentMoveIndex === 0) {
          newFens.push(chess.fen());
        } else {
          newFens.splice(
            currentMoveIndex + 1,
            fenPositions.length - currentMoveIndex - 1,
            chess.fen(),
          );
        }
      }

      setFenPositions(newFens);
      setCurrentMoveIndex(newFens.length - 1);

      return true;
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', mt: 2 }} className={'chessboard'}>
        <Chessboard
          position={fenPositions[currentMoveIndex]}
          boardWidth={400}
          animationDuration={0}
          boardOrientation={flipBoard ? 'black' : 'white'}
          onPieceDrop={handleMovePiece}
        />
        {
          showMoveTracker && <MoveTracker
            pgnMoves={pgnMoves}
            currentMoveIndex={currentMoveIndex}
            handleMoveClick={handleMoveClick}
          />
        }
        {
          showStockfish && <StockfishAnalysis
            fen={fenPositions[currentMoveIndex]} />
        }

      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <IconButton onClick={handleSkipToStart} disabled={currentMoveIndex === 0} color="secondary">
          <KeyboardDoubleArrowLeft />
        </IconButton>
        <IconButton onClick={() => setCurrentMoveIndex((prev) => prev - 1)} disabled={currentMoveIndex === 0} color="secondary">
          <KeyboardArrowLeft />
        </IconButton>
        <IconButton onClick={() => setCurrentMoveIndex((prev) => prev + 1)} disabled={currentMoveIndex === fenPositions.length - 1} color="secondary">
          <KeyboardArrowRight />
        </IconButton>
        <IconButton onClick={handleSkipToEnd} disabled={currentMoveIndex === fenPositions.length - 1} color="secondary">
          <KeyboardDoubleArrowRight />
        </IconButton>
        <IconButton onClick={handleFlipBoard} color="secondary">
          <Flip sx={{ transform: flipBoard ? 'rotate(180deg)' : 'none' }} />
        </IconButton>
      </Box>
    </>
  );
};

export default Board;
