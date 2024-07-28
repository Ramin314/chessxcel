import React from 'react';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  footer: {
    backgroundColor: 'transparent',
    padding: theme.spacing(1),
    textAlign: 'center',
    marginTop: theme.spacing(10),
    fontFamily: 'Roboto, sans-serif',
    borderTop: '1px dashed #cccccc80',
    color: '#364657',
    fontSize: '15px',
  },
}));

const Footer = () => {
  const classes = useStyles();

  return (
    <footer className={classes.footer}>
      <p>&copy; {new Date().getFullYear()} ChessXcel. All rights reserved.</p>
      {/* Add any additional footer content, links, etc. */}
    </footer>
  );
};

export default Footer;
