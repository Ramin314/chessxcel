import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Button, Box, TextField, ToggleButton, ToggleButtonGroup, Typography,
} from '@mui/material';
import { LocalizationProvider, MobileDatePicker } from '@mui/x-date-pickers-pro';
import { AdapterDayjs } from '@mui/x-date-pickers-pro/AdapterDayjs';
import axios from 'axios';
import dayjs from 'dayjs';
import { Chess } from 'chess.js';
import Board from '../../components/Board.jsx';
import PlayerTypeAhead from '../../components/PlayerTypeahead.jsx';
import TagTypeAhead from '../../components/TagTypeahead.jsx';
import { useGlobal } from '../GlobalContext.jsx';

const EditGame = () => {
  const { id } = useParams();
  const [date, setDate] = useState(dayjs());
  const [whitePlayer, setWhitePlayer] = useState(null);
  const [blackPlayer, setBlackPlayer] = useState(null);
  const [result, setResult] = useState('');
  const [resultError, setResultError] = useState(false);
  const [moves, setMoves] = useState('');
  const [tag, setTag] = useState(null);
  const [tags, setTags] = useState([]);
  const { globalState } = useGlobal();
  const [textPgn, setTextPgn] = useState('');
  const [validPgn, setValidPgn] = useState(true);
  const [pgnError, setPgnError] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [submissionError, setSubmissionError] = useState(null);

  const navigate = useNavigate();

  const handleDateChange = (newDate) => {
    setDate(newDate);
  };

  const handleResultChange = (event, newResult) => {
    setResult(newResult);
  };

  const handleWhitePlayerChange = (event, newPlayer) => {
    setWhitePlayer(newPlayer);
  };

  const handleBlackPlayerChange = (event, newPlayer) => {
    setBlackPlayer(newPlayer);
  };

  const handleTagChange = (event, newTag) => {
    setTag(newTag);
  };

  useEffect(() => {
    // Fetch game data from /api/games/id and populate the fields
    axios.get(`${globalState.baseApiUrl}/api/games/${id}`)
      .then((response) => {
        const game = response.data;
        setDate(dayjs(game.datePlayed));
        setWhitePlayer(game.whitePlayer);
        setBlackPlayer(game.blackPlayer);
        setResult(game.result);
        setMoves(game.moves);
        setTags(game.tags);
      })
      .catch((error) => {
        console.error('Error fetching game data:', error);
      });
  }, [id, globalState.baseApiUrl]);

  useEffect(() => {
    if (submissionResult) {
      navigate(`/games/${submissionResult.id}`);
    }
  }, [submissionResult, navigate]);

  const handleSubmit = () => {
    setResultError(false);
    setSubmissionResult(null);
    setSubmissionError(null);

    if (pgnError) {
      return;
    }

    if (!result) {
      setResultError(true);
      return;
    }

    const game = {
      datePlayed: date.toISOString().split('T')[0],
      whitePlayerId: typeof whitePlayer?.id === 'string' ? whitePlayer.name : whitePlayer?.id,
      blackPlayerId: typeof blackPlayer?.id === 'string' ? blackPlayer.name : blackPlayer?.id,
      result,
      moves,
      tags: tags.map((_tag) => (typeof _tag?.id === 'string' ? _tag.name : _tag?.id)),
    };

    axios.post(`${globalState.baseApiUrl}/api/games/update/${id}`, game)
      .then((response) => {
        setSubmissionResult(response.data);
      })
      .catch((error) => {
        setSubmissionError('Something went wrong. Please try again.');
      });
  };

  useEffect(() => {
    setTextPgn(moves);
    setValidPgn(true);
    setPgnError(null);
  }, [moves]);

  return (
    <>
    <Box sx={{ m: 5 }}></Box>

    <Typography variant="h1" className='view-heading'>
      Edit Game
    </Typography>

    <Box sx={{ m: 5 }}></Box>

    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <MobileDatePicker
        format="DD/MM/YYYY"
        label="Date played"
        value={date}
        onChange={handleDateChange}
      />
    </LocalizationProvider>

    <Box sx={{ m: 2 }}></Box>

    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginBottom: '10px',
    }}>

      <Typography variant="caption" color="textSecondary" style={{ marginLeft: '1em' }}>
        Result
      </Typography>

      <ToggleButtonGroup
        value={result}
        exclusive
        onChange={handleResultChange}
        aria-label="result"
      >
        <ToggleButton value="white" aria-label="white" style={{ fontSize: '1em', textTransform: 'none' }}>
          white
        </ToggleButton>
        <ToggleButton value="draw" aria-label="draw" style={{ fontSize: '1em', textTransform: 'none' }}>
          draw
        </ToggleButton>
        <ToggleButton value="black" aria-label="black" style={{ fontSize: '1em', textTransform: 'none' }}>
          black
        </ToggleButton>
      </ToggleButtonGroup>
      {resultError && <Typography variant="caption" color="error" style={{ marginTop: '.5em', marginLeft: '1em' }}>Choose a result!</Typography>}
    </div>

    <Box sx={{ m: 2 }}></Box>

    <PlayerTypeAhead
      value={whitePlayer}
      onChange={handleWhitePlayerChange}
      label="White player"
    />

    <Box sx={{ m: 2 }}></Box>

    <PlayerTypeAhead
      value={blackPlayer}
      onChange={handleBlackPlayerChange}
      label="Black player"
    />

    <Box sx={{ m: 2 }}></Box>

    <Board position="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" pgnMoves={moves} setPgnMoves={setMoves} edit={false} showMoveTracker={true} />

    <Box sx={{ m: 2 }}></Box>

    <TagTypeAhead
      label="Tags"
      tags={tags}
      setTags={setTags}
      value={tag}
      onChange={handleTagChange}
    />

    <Box sx={{ m: 2 }}></Box>

    <div>
      <Button variant="contained" onClick={handleSubmit} className='oval-button' color='secondary'>
        Update Game
      </Button>
    </div>
    {submissionError && (
      <>
        <Box sx={{ m: 2 }}></Box>
        <Typography color="error">
          {submissionError}
        </Typography>
      </>
    )}

  </>
  );
};

export default EditGame;
