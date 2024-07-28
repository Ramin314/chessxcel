import React, { useEffect, useState } from 'react';
import {
  Autocomplete,
  Box,
  Chip,
  TextField,
} from '@mui/material';
import { Cancel } from '@mui/icons-material';
import axios from 'axios';

import { useGlobal } from '../views/GlobalContext.jsx';

const TagTypeAhead = ({
  value, onChange, tags, setTags, label,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState([]);
  const { globalState } = useGlobal();

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await axios.get(`${globalState.baseApiUrl}/api/tags?name=${inputValue}`);
        setOptions([...response.data, { name: 'Add new tag', id: 'new' }]);
      } catch (error) {
        console.error('Error fetching tags:', error);
        setOptions([]);
      }
    };
    fetchTags();
  }, [inputValue]);

  const handleAddNewTag = () => {
    if (inputValue.trim() !== '') {
      const newTag = { name: inputValue, id: `new${Math.random().toString(36).substr(2, 10)}` };
      setInputValue('');
      onChange(null, newTag);
      setTags((prevTags) => [...new Set([...prevTags, newTag])]);
    }
  };

  const handleAddExistingTag = (tag) => {
    setInputValue('');
    onChange(null, tag);
    setTags((prevTags) => [...new Set([...prevTags, tag])]);
  };

  const handleInputChange = (event, newInputValue) => {
    setInputValue(newInputValue);
  };

  const handleDeleteTag = (tagId) => {
    setTags((prevTags) => prevTags.filter((tag) => tag.id !== tagId));
  };

  return (
    <>
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
            handleAddNewTag();
          } else if (newValue) {
            handleAddExistingTag(newValue);
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
              <button>{option.name}</button> // onClick=handleAddNewTag
            ) : (
              option.name
            )}
          </li>
        )}
      />
      <Box sx={{ m: 2 }}></Box>
      <div>
        {tags.map((tag) => (
          <Chip
            key={tag.id}
            label={tag.name}
            onDelete={() => handleDeleteTag(tag.id)}
            deleteIcon={<Cancel />}
          />
        ))}
      </div>
    </>
  );
};

export default TagTypeAhead;
