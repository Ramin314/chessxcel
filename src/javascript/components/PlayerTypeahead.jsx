import React, { useEffect, useState } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import axios from 'axios';

import { useGlobal } from '../views/GlobalContext.jsx';

const PlayerTypeAhead = ({ value, onChange, label }) => {
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState([]);
  const { globalState } = useGlobal();

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await axios.get(`${globalState.baseApiUrl}/api/players?name=${inputValue}`);
        setOptions([...response.data, { name: 'Add new player', id: 'new' }]);
      } catch (error) {
        console.error('Error fetching players:', error);
        setOptions([]);
      }
    };
    fetchPlayers();
  }, [inputValue]);

  const handleAddNewPlayer = () => {
    if (inputValue.trim() !== '') {
      const newPlayer = { name: inputValue, id: `new${Math.random().toString(36).substr(2, 10)}` };
      setInputValue('');
      onChange(null, newPlayer);
    }
  };

  const handleInputChange = (event, newInputValue) => {
    setInputValue(newInputValue);
  };

  return (
    <Autocomplete
      options={options}
      getOptionLabel={(option) => option.name}
      value={value}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      isOptionEqualToValue={(option, selectedValue) => option.id === selectedValue.id
        || (option.id === 'new' && option.name === inputValue)
      }
      renderInput={(params) => <TextField {...params} label={label} />}
      onChange={(event, newValue) => {
        if (newValue && newValue.id === 'new') {
          handleAddNewPlayer();
        } else {
          onChange(event, newValue);
        }
      }}
      filterOptions={(_options, state) => _options.filter(
        (option) => option.id === 'new'
            || option.name.toLowerCase().includes(state.inputValue.toLowerCase()),
      )
      }
      renderOption={(props, option) => (
        <li {...props}>
          {option.id === 'new' ? (
            <button onClick={handleAddNewPlayer}>{option.name}</button>
          ) : (
            option.name
          )}
        </li>
      )}
    />
  );
};

export default PlayerTypeAhead;
