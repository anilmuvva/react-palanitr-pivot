import {
  Box,
  Paper,
  Typography,
  TextField,
  Chip,
  Stack,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useState } from 'react';

const FilterSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

const FilterLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  fontWeight: 600,
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(1),
  textTransform: 'uppercase',
}));

interface FilterPanelProps {
  partName: string;
  setPartName: (value: string) => void;
  fileNumber: string;
  setFileNumber: (value: string) => void;
  spsStatus: string[];
  setSpsStatus: (value: string[]) => void;
  orderSiteValue: string;
  setOrderSiteValue: (value: string) => void;
  productionLine: string;
  setProductionLine: (value: string) => void;
}

export default function FilterPanel({
  partName,
  setPartName,
  fileNumber,
  setFileNumber,
  spsStatus,
  setSpsStatus,
  orderSiteValue,
  setOrderSiteValue,
  productionLine,
  setProductionLine,
}: FilterPanelProps) {
  const [inputValue, setInputValue] = useState('');

  const handleInputKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      const value = inputValue.trim();
      if (value && !spsStatus.includes(value)) {
        setSpsStatus([...spsStatus, value]);
      }
      setInputValue('');
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    // Handle comma-separated input
    if (value.includes(',')) {
      const newStatuses = value.split(',').map(s => s.trim()).filter(s => s && !spsStatus.includes(s));
      if (newStatuses.length > 0) {
        setSpsStatus([...spsStatus, ...newStatuses]);
      }
      setInputValue('');
    } else {
      setInputValue(value);
    }
  };

  const handleDeleteChip = (statusToDelete: string) => {
    setSpsStatus(spsStatus.filter(status => status !== statusToDelete));
  };

  const resetToDefault = () => {
    setSpsStatus(['AO', 'Firm', 'Pending', 'Available', 'Reserved']);
  };


  return (
    <Paper elevation={1} sx={{ p: 2, width: 300, height: 'fit-content' }}>
      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        🔍 Filters
      </Typography>

      <FilterSection>
        <FilterLabel>PART NAME</FilterLabel>
        <TextField
          fullWidth
          size="small"
          placeholder="Search..."
          value={partName}
          onChange={(e) => setPartName(e.target.value)}
          variant="outlined"
        />
      </FilterSection>

      <FilterSection>
        <FilterLabel>FILE NUMBER</FilterLabel>
        <TextField
          fullWidth
          size="small"
          placeholder="Search..."
          value={fileNumber}
          onChange={(e) => setFileNumber(e.target.value)}
          variant="outlined"
        />
      </FilterSection>

      <FilterSection>
        <FilterLabel>SPS STATUS</FilterLabel>
        <TextField
          fullWidth
          size="small"
          placeholder="Type status and press Enter or comma..."
          variant="outlined"
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleInputKeyPress}
        />
        {spsStatus.length > 0 && (
          <Stack direction="row" spacing={0.5} sx={{ mt: 1, flexWrap: 'wrap', gap: 0.5 }}>
            {spsStatus.map((status) => (
              <Chip
                key={status}
                label={status}
                onDelete={() => handleDeleteChip(status)}
                size="small"
                color="primary"
                variant="outlined"
              />
            ))}
          </Stack>
        )}
        <Typography 
          variant="caption" 
          color="text.secondary" 
          sx={{ 
            display: 'block', 
            mt: 0.5, 
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
          onClick={resetToDefault}
        >
          Reset to default values
        </Typography>
      </FilterSection>

      <FilterSection>
        <FilterLabel>ORDER SITE VALUE</FilterLabel>
        <TextField
          fullWidth
          size="small"
          placeholder="Search..."
          value={orderSiteValue}
          onChange={(e) => setOrderSiteValue(e.target.value)}
          variant="outlined"
        />
      </FilterSection>

      <FilterSection>
        <FilterLabel>PRODUCTION LINE</FilterLabel>
        <TextField
          fullWidth
          size="small"
          placeholder="Search..."
          value={productionLine}
          onChange={(e) => setProductionLine(e.target.value)}
          variant="outlined"
        />
      </FilterSection>
    </Paper>
  );
}