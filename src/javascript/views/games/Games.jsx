import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  Button,
  Box,
  Modal,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Cancel as CancelIcon,
  Psychology as PsychologyIcon,
} from '@mui/icons-material';
import Board from '../../components/Board.jsx';
import Pagination from '../../components/Pagination.jsx';
import CustomAlert from '../../components/CustomAlert.jsx';

import { useGlobal } from '../GlobalContext.jsx';

const Games = () => {
  const [games, setGames] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedGameId, setExpandedGameId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const { globalState } = useGlobal();

  const fetchGames = async () => {
    try {
      const response = await axios.get(`${globalState.baseApiUrl}/api/games?page=${currentPage}`);
      setGames(response.data.games);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching games:', error);
    }
  };

  useEffect(() => {
    fetchGames();
  }, [currentPage]);

  const handleExpandGame = (gameId) => {
    if (expandedGameId === gameId) {
      setExpandedGameId(null);
    } else {
      setExpandedGameId(gameId);
    }
  };

  const handleDeleteClick = (gameId) => {
    setSelectedGameId(gameId);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.post(`${globalState.baseApiUrl}/api/games/delete/${selectedGameId}`);
      setDeleteMessage('Game successfully deleted');
      setShowDeleteModal(false);
      fetchGames();
      setAlertVisible(true);
    } catch (error) {
      setDeleteMessage('Error deleting the game');
      setAlertVisible(true);
    }
  };

  const handleDeleteModalClose = () => {
    setShowDeleteModal(false);
  };

  return (
    <>
      <Box sx={{ m: 5 }}></Box>
      <Typography variant="h1" className='view-heading'>
        Games
        <Link to="/games/create">
          <Button variant="contained" style={{ float: 'right' }} className='oval-button' color='secondary'>
          <svg style={{ width: '15px', marginRight: '8px' }} aria-hidden="true" focusable="false" data-prefix="fas" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" data-fa-i2svg=""><path fill="currentColor" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM232 344V280H168c-13.3 0-24-10.7-24-24s10.7-24 24-24h64V168c0-13.3 10.7-24 24-24s24 10.7 24 24v64h64c13.3 0 24 10.7 24 24s-10.7 24-24 24H280v64c0 13.3-10.7 24-24 24s-24-10.7-24-24z"></path></svg>
            New Game
          </Button>
        </Link>
      </Typography>
      <Box sx={{ m: 5 }}></Box>

      <Board position="start" pgnMoves={''} edit={true} showMoveTracker={false} showStockfish={false} showExplorer={true} />

      {alertVisible && (
        <CustomAlert deleteMessage={deleteMessage} alertVisible={alertVisible} />
      )}

      <TableContainer component={Paper} style={{ boxShadow: 'none' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography>Date</Typography>
              </TableCell>
              <TableCell>
                <Typography>Result</Typography>
              </TableCell>
              <TableCell>
                <Typography>White</Typography>
              </TableCell>
              <TableCell>
                <Typography>Black</Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {games.map((game) => (
              <React.Fragment key={game.id}>
                <TableRow onClick={() => handleExpandGame(game.id)}>
                  <TableCell>
                    <Typography>{game.datePlayed || '-'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography>{game.result}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography>
                      {game.whitePlayer?.name || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography>
                      {game.blackPlayer?.name || '-'}
                    </Typography>
                  </TableCell>
                </TableRow>
                {expandedGameId === game.id && (
                  <TableRow>
                    <TableCell colSpan={4}>
                          <Board position="start" pgnMoves={game.moves || ''} edit={false} showMoveTracker={true} showStockfish={false} />
                          <Button variant='contained' style={{ float: 'right', backgroundColor: 'red', marginRight: '1em' }} className='oval-button' color="secondary" onClick={() => handleDeleteClick(game.id)}>
                            <DeleteIcon style={{ marginRight: '5px', fontSize: '17px' }} />
                            Delete
                          </Button>
                          <Link to={`/games/${game.id}/edit`}>
                            <Button variant="contained" style={{ float: 'right', marginRight: '1em' }} className='oval-button' color='secondary'>
                              <EditIcon style={{ marginRight: '5px', fontSize: '17px' }} />
                              Edit
                            </Button>
                          </Link>
                          <Link to={`/games/${game.id}`}>
                            <Button variant="contained" style={{ float: 'right', marginRight: '1em' }} className='oval-button' color='tertiary'>
                              <PsychologyIcon style={{ marginRight: '5px', fontSize: '17px' }} />
                              Study
                            </Button>
                          </Link>

                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Modal open={showDeleteModal} onClose={handleDeleteModalClose}>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '5px',
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
        }}>
          <Typography variant="h6" className='view-heading-2'>Are you sure you want to delete this game?</Typography>
          <br />
          <Typography>Deleting a game cannot be undone.</Typography>
          <br />
          <Button variant="contained" style={{ backgroundColor: 'red', color: 'white', margin: '.5em' }} className='oval-button' onClick={handleDeleteConfirm}>
            <DeleteIcon style={{ marginRight: '5px', fontSize: '17px' }} />
            Delete
          </Button>
          <Button variant="contained" style={{ margin: '.5em' }} className='oval-button' onClick={handleDeleteModalClose}>
            <CancelIcon style={{ marginRight: '5px', fontSize: '17px' }} />
            Cancel
          </Button>
        </div>
      </Modal>
      <Box sx={{ m: 5 }}></Box>
      <Pagination currentPage={currentPage} totalPages={totalPages} />
    </>
  );
};

export default Games;
