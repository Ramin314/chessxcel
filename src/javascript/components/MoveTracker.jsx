import React from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableRow, Paper,
} from '@mui/material';

const MoveTracker = ({ pgnMoves, currentMoveIndex, handleMoveClick }) => {
  const moves = pgnMoves.split(/\d+\./).filter((move) => move.trim().length > 0);

  const handleClick = (moveIndex) => {
    handleMoveClick(moveIndex);
  };

  return (
    <TableContainer component={Paper} className='move-tracker' style={{
      boxShadow: 'none',
      border: '1px solid #80808029',
      borderRadius: '0',
    }}>
      <Table aria-label="move-tracker-table">
        <TableBody>
          {moves.map((movePair, index) => {
            const moveNumber = index;
            const moveTokens = movePair.trim().split(/\s+/);
            const whiteMove = moveTokens[0] || '';
            const blackMove = moveTokens[1] || '';
            return (
              <TableRow key={moveNumber}>
                <TableCell align="center">
                  {index + 1}
                </TableCell>
                <TableCell
                    style={{
                      backgroundColor: currentMoveIndex === 2 * (index + 1) - 1 ? '#00000012' : 'white',
                    }}
                    align="center"
                    onClick={() => (whiteMove ? handleClick(2 * (index + 1) - 1) : true)}
                    sx={{ cursor: 'pointer' }}>
                  {whiteMove}
                </TableCell>
                <TableCell
                    style={{
                      backgroundColor: currentMoveIndex === 2 * (index + 1) ? '#00000012' : 'white',
                    }}
                    align="center"
                    onClick={() => (blackMove ? handleClick(2 * (index + 1)) : true)}
                    sx={{ cursor: 'pointer' }}>
                  {blackMove}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default MoveTracker;
