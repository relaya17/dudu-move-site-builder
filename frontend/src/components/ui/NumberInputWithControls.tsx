import React from 'react';
import { TextField, Box, IconButton, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

interface NumberInputWithControlsProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string; // New prop for unit
}

export const NumberInputWithControls: React.FC<NumberInputWithControlsProps> = ({
  label,
  value,
  onChange,
  min = 0,
  max = Infinity,
  step = 1,
  unit, // Destructure new prop
}) => {
  const handleIncrement = () => {
    const newValue = value + step;
    onChange(newValue <= max ? newValue : max);
  };

  const handleDecrement = () => {
    const newValue = value - step;
    onChange(newValue >= min ? newValue : min);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(event.target.value, 10);
    if (!isNaN(newValue)) {
      onChange(newValue);
    } else if (event.target.value === '') {
      onChange(min); // Or null, depending on desired behavior for empty input
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <Typography variant="body1" sx={{ mr: 1, minWidth: '80px' }}>{label}</Typography>
      <IconButton onClick={handleDecrement} disabled={value <= min} size="small">
        <RemoveIcon />
      </IconButton>
      <TextField
        type="number"
        value={value}
        onChange={handleInputChange}
        inputProps={{
          min,
          max,
          step,
          style: { textAlign: 'center', padding: '8px 4px' },
        }}
        sx={{ width: '80px', mx: 1 }}
        variant="outlined"
        size="small"
      />
      <IconButton onClick={handleIncrement} disabled={value >= max} size="small">
        <AddIcon />
      </IconButton>
      {unit && <Typography variant="body1" sx={{ ml: 1 }}>{unit}</Typography>} {/* Display unit if provided */}
    </Box>
  );
};

export default NumberInputWithControls;