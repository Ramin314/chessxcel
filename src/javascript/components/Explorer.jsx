import React, { useEffect, useState } from 'react';
import { Typography } from '@mui/material';

const Explorer = ({ fenPositions, currentMoveIndex }) => {
  const [currentFen, setCurrentFen] = useState('');

  useEffect(() => {
    setCurrentFen(fenPositions[currentMoveIndex]);
  }, [fenPositions, currentMoveIndex]);

  return (
    <div style={{ marginTop: '1em' }}>
      <Typography variant="h6">Current FEN:</Typography>
      <Typography>{currentFen}</Typography>
    </div>
  );
};

export default Explorer;
