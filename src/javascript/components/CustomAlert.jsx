import React, { useState } from 'react';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

const CustomAlert = ({ deleteMessage, alertVisible }) => {
  const [open, setOpen] = useState(alertVisible);

  const handleClose = (event) => {
    setOpen(false);
  };

  return (
    <div>
      {open && (
        <Alert
          variant="filled"
          severity={deleteMessage.includes('Error') ? 'error' : 'success'}
          style={{ marginBottom: '1em' }}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={handleClose}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
        >
          {deleteMessage}
        </Alert>
      )}
    </div>
  );
};

export default CustomAlert;
