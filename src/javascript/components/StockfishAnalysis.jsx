import React, { useState, useEffect, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';

const StockfishAnalysis = ({ fen }) => {
  const [evaluation, setEvaluation] = useState(null);
  const [lines, setLines] = useState([]);

  useEffect(() => {
    console.log(fen);
    const fetchStockfishAnalysis = () => {
      const depth = 20;
      window.stockfish.onmessage = (event) => {
        console.log(event.data);
        const message = event.data;
        if (message.includes('info depth')) {
          const evaluationMatch = message.match(/score cp (-?\d+)/);
          setEvaluation(evaluationMatch ? parseInt(evaluationMatch[1], 10) : null);

          const linesMatch = message.match(/pv (.+)/);
          if (linesMatch) {
            const linesArray = linesMatch[1].split(' ');
            const engineLines = [];
            for (let i = 0; i < linesArray.length; i += 1) {
              const move = linesArray[i];
              const nextMove = linesArray[i + 1];
              if (move && nextMove) {
                engineLines.push({ move, evaluation: nextMove });
                i += 1;
              }
            }
            setLines(engineLines);
          }
        }
      };
      window.stockfish.postMessage(`position fen ${fen}`);
      window.stockfish.postMessage(`go depth ${Math.min(depth, 24)}`);
    };
    fetchStockfishAnalysis();
  }, [fen]);

  return (
    <div>
      <p>Stockfish Evaluation: {evaluation}</p>
      <TableContainer component={Paper}>
        <Table aria-label="stockfish-lines-table">
          <TableHead>
            <TableRow>
              <TableCell align="center">Line</TableCell>
              <TableCell align="center">Evaluation</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lines.map((line, index) => (
              <TableRow key={index}>
                <TableCell align="center">{line.move}</TableCell>
                <TableCell align="center">{line.evaluation}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default StockfishAnalysis;
