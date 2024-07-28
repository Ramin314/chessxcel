import React from 'react';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

const Pagination = ({ currentPage, totalPages, setCurrentPage }) => (
    <div style={{
      justifyContent: 'center', display: 'flex', gap: '15px', alignItems: 'center',
    }}>
      <Button
        onClick={() => setCurrentPage((prev) => prev - 1)}
        disabled={currentPage <= 1}
        variant="contained"
        color="secondary"
        sx={{ height: '2.7em' }}
      >
        <svg height="1em" viewBox="0 0 320 512" fill={'white'}>
              <path d="M41.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 256 246.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/>
        </svg>
      </Button>
      <Typography>
        {currentPage} / {totalPages == 0 ? 1 : totalPages}
      </Typography>
      <Button
        onClick={() => setCurrentPage((prev) => prev + 1)}
        disabled={currentPage >= totalPages}
        variant="contained"
        color="secondary"
        sx={{ height: '2.7em' }}
      >
        <svg height="1em" viewBox="0 0 320 512" fill={'white'}>
            <path d="M278.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L210.7 256 73.4 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160z"/>
        </svg>
      </Button>
    </div>
);

export default Pagination;
