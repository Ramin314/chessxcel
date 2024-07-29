import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Typography,
} from '@mui/material';
import { Chess } from 'chess.js';

const Explorer = ({
  fenPositions,
  currentMoveIndex,
  handleMoveClick,
  setFenPositions,
  setCurrentMoveIndex,
}) => {
  const [currentFen, setCurrentFen] = useState('');
  const [positions, setPositions] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    setCurrentFen(fenPositions[currentMoveIndex]);
    setError(null);
  }, [fenPositions, currentMoveIndex]);

  useEffect(() => {
    const fetchPositionData = async (fen) => {
      try {
        const response = await fetch(`http://localhost:8080/api/positions/${encodeURIComponent(fen)}`);
        if (!response.ok) {
          throw new Error(`Error fetching data for FEN: ${fen}`);
        }
        const data = await response.json();
        return data;
      } catch (err) {
        return null;
      }
    };

    const fetchData = async () => {
      try {
        const chess = new Chess();
        chess.load(currentFen);

        const positionData = await fetchPositionData(currentFen);
        if (!positionData) {
          throw new Error(`Error fetching data for FEN: ${currentFen}`);
        }

        const moveData = await Promise.all(positionData.movesPlayed.map(async (move) => {
          try {
            chess.move(move);
            const newFen = chess.fen();
            const moveResultData = await fetchPositionData(newFen);
            chess.undo();
            return {
              move,
              fen: newFen,
              ...moveResultData,
            };
          } catch (err) {
            return {
              move,
              gamesWonByWhite: 0,
              gamesWonByBlack: 0,
              gamesDrawn: 0,
            };
          }
        }));
        setPositions(moveData);
      } catch (err) {
        setPositions([]);
      }
    };

    if (currentFen) {
      fetchData();
    }
  }, [currentFen]);

  return (
        <TableContainer className='move-tracker' component={Paper} style={{
          boxShadow: 'none',
          border: '1px solid #80808029',
          borderRadius: '0',
        }}>
        {positions.length > 0 ? (
          <Table aria-label="explorer-table">
            <TableBody>
              {positions.map((pos, index) => (
                <TableRow
                  key={index}
                  onClick={
                    () => {
                      setFenPositions([...fenPositions.slice(0, currentMoveIndex + 1), pos.fen]);
                      setCurrentMoveIndex(currentMoveIndex + 1);
                    }}
                  style={{ cursor: 'pointer' }}
                >
                  <TableCell align="center">{pos.move}</TableCell>
                  <TableCell align="center">{pos.gamesWonByWhite}</TableCell>
                  <TableCell align="center" style={{ background: '#a4a4a4', color: 'white' }}>{pos.gamesDrawn}</TableCell>
                  <TableCell align="center" style={{ background: 'black', color: 'white' }}>{pos.gamesWonByBlack}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : <Typography variant="body1">
            No games in the database!
            </Typography>}
        </TableContainer>
  );
};

export default Explorer;
